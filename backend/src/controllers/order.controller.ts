import type { Request, Response } from 'express';
import * as orderService from '@/services/order.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function listOrders(req: Request, res: Response): void {
  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const result = orderService.listOrders(page, limit);
  res.json(result);
}

export function getOrder(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const result = orderService.getOrder(id);
  
  if (!result.success) {
    res.status(404).json(result);
    return;
  }
  
  res.json(result);
}

export function createOrder(req: Request, res: Response): void {
  const result = orderService.createOrder(req.body);
  
  if (!result.success) {
    const isConflict = result.error?.includes('CONFLICT');
    res.status(isConflict ? 409 : 400).json(result);
    return;
  }
  
  res.status(201).json(result);
}
