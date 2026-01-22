import { z } from 'zod';
import { ENTITY_TYPE, MAP_TYPES, SHARE_ID_REGEX } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, serverError, unauthorized } from '@/lib/response';
import { canDeleteWebsite, canUpdateWebsite, canViewWebsite } from '@/permissions';
import {
  createShare,
  deleteSharesByEntityId,
  deleteWebsite,
  getShareByEntityId,
  getWebsite,
  updateWebsite,
} from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const website = await getWebsite(websiteId);

  return json(website);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    name: z.string().optional(),
    domain: z.string().optional(),
    shareId: z.string().regex(SHARE_ID_REGEX).nullable().optional(),
    mapType: z.enum([MAP_TYPES.world, MAP_TYPES.usa]).optional(),
    replayEnabled: z.boolean().optional(),
    replayConfig: z
      .object({
        sampleRate: z.number().min(0).max(1).optional(),
        maskLevel: z.enum(['strict', 'moderate']).optional(),
        maxDuration: z.number().int().positive().optional(),
        blockSelector: z.string().optional(),
      })
      .nullable()
      .optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { name, domain, shareId, mapType, replayEnabled, replayConfig } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const website = await updateWebsite(websiteId, {
      name,
      domain,
      mapType,
      ...(replayEnabled !== undefined && { replayEnabled }),
      ...(replayConfig !== undefined && { replayConfig }),
    });

    if (shareId === null) {
      await deleteSharesByEntityId(website.id);
    }

    const share = shareId
      ? await createShare({
          id: uuid(),
          entityId: websiteId,
          shareType: ENTITY_TYPE.website,
          name: website.name,
          slug: shareId,
          parameters: { overview: true, events: true },
        })
      : await getShareByEntityId(websiteId);

    return json({
      ...website,
      shareId: share?.slug ?? null,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint')) {
      return badRequest({ message: 'That share ID is already taken.' });
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await deleteWebsite(websiteId);

  return ok();
}
