import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { figureInventoryValidationSchema } from 'validationSchema/figure-inventories';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.figure_inventory
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getFigureInventoryById();
    case 'PUT':
      return updateFigureInventoryById();
    case 'DELETE':
      return deleteFigureInventoryById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getFigureInventoryById() {
    const data = await prisma.figure_inventory.findFirst(convertQueryToPrismaUtil(req.query, 'figure_inventory'));
    return res.status(200).json(data);
  }

  async function updateFigureInventoryById() {
    await figureInventoryValidationSchema.validate(req.body);
    const data = await prisma.figure_inventory.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deleteFigureInventoryById() {
    const data = await prisma.figure_inventory.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
