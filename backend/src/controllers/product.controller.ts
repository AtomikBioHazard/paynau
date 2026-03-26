import type { Request, Response } from 'express';
import * as productService from '@/services/product.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function listProducts(req: Request, res: Response): void {
  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const result = productService.listProducts(page, limit);
  res.json(result);
}

export function getProduct(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const result = productService.getProduct(id);
  
  if (!result.success) {
    res.status(404).json(result);
    return;
  }
  
  res.json(result);
}

export function createProduct(req: Request, res: Response): void {
  const result = productService.createProduct(req.body);
  
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  
  res.status(201).json(result);
}

export function updateProduct(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const result = productService.updateProduct(id, req.body);
  
  if (!result.success) {
    const status = result.error?.includes('not found') ? 404 : 400;
    res.status(status).json(result);
    return;
  }
  
  res.json(result);
}

export function deleteProduct(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const result = productService.deleteProduct(id);
  
  if (!result.success) {
    res.status(404).json(result);
    return;
  }
  
  res.status(204).send();
}
