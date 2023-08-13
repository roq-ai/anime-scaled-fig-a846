import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { discussionBoardValidationSchema } from 'validationSchema/discussion-boards';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.discussion_board
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getDiscussionBoardById();
    case 'PUT':
      return updateDiscussionBoardById();
    case 'DELETE':
      return deleteDiscussionBoardById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getDiscussionBoardById() {
    const data = await prisma.discussion_board.findFirst(convertQueryToPrismaUtil(req.query, 'discussion_board'));
    return res.status(200).json(data);
  }

  async function updateDiscussionBoardById() {
    await discussionBoardValidationSchema.validate(req.body);
    const data = await prisma.discussion_board.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deleteDiscussionBoardById() {
    const data = await prisma.discussion_board.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
