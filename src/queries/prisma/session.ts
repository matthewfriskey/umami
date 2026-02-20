import prisma from '@/lib/prisma';

export async function getWebsiteIgnoredSessionIds(websiteId: string): Promise<string[]> {
  const sessions = await prisma.client.session.findMany({
    where: {
      websiteId,
      isIgnored: true,
    },
    select: {
      id: true,
    },
  });

  return sessions.map(session => session.id);
}

export async function updateWebsiteSessionIgnored(
  websiteId: string,
  sessionId: string,
  isIgnored: boolean,
) {
  return prisma.client.session.updateMany({
    where: {
      id: sessionId,
      websiteId,
    },
    data: {
      isIgnored,
    },
  });
}

export async function getWebsiteSessionMeta(websiteId: string, sessionId: string) {
  return prisma.client.session.findFirst({
    where: {
      id: sessionId,
      websiteId,
    },
    select: {
      isIgnored: true,
    },
  });
}
