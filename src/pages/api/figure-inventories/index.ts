import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { authorizationValidationMiddleware, errorHandlerMiddleware } from 'server/middlewares';
import { figureInventoryValidationSchema } from 'validationSchema/figure-inventories';
import { convertQueryToPrismaUtil, getOrderByOptions, parseQueryParams } from 'server/utils';
import { getServerSession } from '@roq/nextjs';
import { GetManyQueryOptions } from 'interfaces';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getFigureInventories();
    case 'POST':
      return createFigureInventory();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getFigureInventories() {
    const {
      limit: _limit,
      offset: _offset,
      order,
      ...query
    } = parseQueryParams(req.query) as Partial<GetManyQueryOptions>;
    const limit = parseInt(_limit as string, 10) || 20;
    const offset = parseInt(_offset as string, 10) || 0;
    const response = await prisma.figure_inventory
      .withAuthorization({
        roqUserId,
        tenantId: user.tenantId,
        roles: user.roles,
      })
      .findManyPaginated({
        ...convertQueryToPrismaUtil(query, 'figure_inventory'),
        take: limit,
        skip: offset,
        ...(order?.length && {
          orderBy: getOrderByOptions(order),
        }),
      });
    return res.status(200).json(response);
  }

  async function createFigureInventory() {
    await figureInventoryValidationSchema.validate(req.body);
    const body = { ...req.body };
    if (body?.purchase_history?.length > 0) {
      const create_purchase_history = body.purchase_history;
      body.purchase_history = {
        create: create_purchase_history,
      };
    } else {
      delete body.purchase_history;
    }
    if (body?.sales_analytics?.length > 0) {
      const create_sales_analytics = body.sales_analytics;
      body.sales_analytics = {
        create: create_sales_analytics,
      };
    } else {
      delete body.sales_analytics;
    }
    const data = await prisma.figure_inventory.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
