ARG NODE_IMAGE_VERSION="22-alpine"
ARG PNPM_VERSION="10.11.0"
# Keep in sync with the resolved Prisma versions in pnpm-lock.yaml.
ARG PRISMA_VERSION="7.6.0"

# Install dependencies only when needed
FROM node:${NODE_IMAGE_VERSION} AS deps
ARG PNPM_VERSION
ARG PRISMA_VERSION
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --frozen-lockfile
# Fail rather than ship a runner that differs from the generated client's toolchain.
RUN node -e 'for (const name of ["prisma", "@prisma/client", "@prisma/adapter-pg"]) { \
      const version = require("./node_modules/" + name + "/package.json").version; \
      if (version !== process.env.PRISMA_VERSION) throw new Error(`${name}@${version} does not match PRISMA_VERSION=${process.env.PRISMA_VERSION}`); \
    }'

# Install the complete, locked runtime tree independently of Next.js tracing.
FROM node:${NODE_IMAGE_VERSION} AS runtime-deps
ARG PNPM_VERSION
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --prod --frozen-lockfile

# Rebuild the source code only when needed
FROM node:${NODE_IMAGE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY docker/proxy.ts ./src

ARG BASE_PATH

ENV BASE_PATH=$BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"

RUN npm run build-docker

# Production image, copy all the files and run next
FROM node:${NODE_IMAGE_VERSION} AS runner
WORKDIR /app

ARG PNPM_VERSION
ARG NODE_OPTIONS

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=$NODE_OPTIONS

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN set -x \
    && apk add --no-cache curl \
    && npm install -g pnpm@${PNPM_VERSION}

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/generated ./generated

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Standalone tracing includes only parts of some packages and does not trace
# startup scripts. Replace that tree instead of merging different pnpm layouts.
RUN rm -rf node_modules
COPY --from=runtime-deps /app/node_modules ./node_modules

USER nextjs

# Check startup imports and the migration CLI without connecting to a database.
RUN SKIP_DB_CHECK=1 node scripts/check-db.js \
    && node scripts/update-tracker.js \
    && DATABASE_URL=postgresql://user:pass@localhost:5432/dummy pnpm exec prisma --version

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["pnpm", "start-docker"]
