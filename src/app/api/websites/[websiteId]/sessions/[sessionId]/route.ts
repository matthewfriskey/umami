import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsite } from '@/permissions';
import { getWebsiteSessionMeta, updateWebsiteSessionIgnored } from '@/queries/prisma';
import { getWebsiteSession } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteSession(websiteId, sessionId);
  if (!data) {
    return notFound();
  }

  const sessionMeta = await getWebsiteSessionMeta(websiteId, sessionId);

  return json({
    ...data,
    isIgnored: sessionMeta?.isIgnored ?? false,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const schema = z.object({
    isIgnored: z.boolean(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await updateWebsiteSessionIgnored(websiteId, sessionId, body.isIgnored);

  if (!result.count) {
    return notFound();
  }

  return json({ ok: true });
}
