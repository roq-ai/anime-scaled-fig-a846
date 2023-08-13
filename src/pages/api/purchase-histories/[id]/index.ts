import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { purchaseHistoryValidationSchema } from 'validationSchema/purchase-histories';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.purchase_history
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getPurchaseHistoryById();
    case 'PUT':
      return updatePurchaseHistoryById();
    case 'DELETE':
      return deletePurchaseHistoryById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getPurchaseHistoryById() {
    const data = await prisma.purchase_history.findFirst(convertQueryToPrismaUtil(req.query, 'purchase_history'));
    return res.status(200).json(data);
  }

  async function updatePurchaseHistoryById() {
    await purchaseHistoryValidationSchema.validate(req.body);
    const data = await prisma.purchase_history.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deletePurchaseHistoryById() {
    const data = await prisma.purchase_history.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
