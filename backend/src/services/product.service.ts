import * as productModel from '@/models/product.model';
import type { Product, ProductInput, ServiceResult, PaginatedResult } from '@/types';

export function listProducts(page?: number, limit?: number): PaginatedResult<Product> {
  return productModel.getAllProducts(page, limit);
}

export function getProduct(id: number): ServiceResult<Product> {
  if (id <= 0) return { success: false, error: 'Invalid product ID' };
  return productModel.getProductById(id);
}

export function createProduct(input: ProductInput): ServiceResult<Product> {
  if (!input.name?.trim()) return { success: false, error: 'Name is required' };
  if (input.price <= 0) return { success: false, error: 'Price must be greater than 0' };
  if (input.stock < 0) return { success: false, error: 'Stock cannot be negative' };
  
  return productModel.createProduct(input);
}

export function updateProduct(id: number, input: Partial<ProductInput>): ServiceResult<Product> {
  if (id <= 0) return { success: false, error: 'Invalid product ID' };
  if (input.price !== undefined && input.price <= 0) 
    return { success: false, error: 'Price must be greater than 0' };
  if (input.stock !== undefined && input.stock < 0)
    return { success: false, error: 'Stock cannot be negative' };
  if (input.name !== undefined && !input.name.trim())
    return { success: false, error: 'Name cannot be empty' };
  
  return productModel.updateProduct(id, input);
}

export function deleteProduct(id: number): ServiceResult<void> {
  if (id <= 0) return { success: false, error: 'Invalid product ID' };
  return productModel.deleteProduct(id);
}
