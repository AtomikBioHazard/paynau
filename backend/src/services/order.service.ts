import * as orderModel from '@/models/order.model';
import * as productModel from '@/models/product.model';
import type { OrderWithItems, OrderInput, ServiceResult, PaginatedResult } from '@/types';

export function listOrders(page?: number, limit?: number): PaginatedResult<OrderWithItems> {
  return orderModel.getAllOrders(page, limit);
}

export function getOrder(id: number): ServiceResult<OrderWithItems> {
  if (id <= 0) return { success: false, error: 'Invalid order ID' };
  return orderModel.getOrderById(id);
}

export function createOrder(input: OrderInput): ServiceResult<OrderWithItems> {
  if (!input.items?.length) return { success: false, error: 'Order must have at least one item' };
  
  const productIds = new Set<number>();
  for (const item of input.items) {
    if (item.quantity <= 0) return { success: false, error: 'Quantity must be greater than 0' };
    if (productIds.has(item.product_id)) return { success: false, error: 'Duplicate products in order' };
    productIds.add(item.product_id);
    
    const productResult = productModel.getProductById(item.product_id);
    if (!productResult.success) return { success: false, error: `Product ${item.product_id} not found` };
    if (productResult.data!.stock < item.quantity) {
      return { 
        success: false, 
        error: `Insufficient stock for "${productResult.data!.name}". Available: ${productResult.data!.stock}, Requested: ${item.quantity}` 
      };
    }
  }
  
  for (const item of input.items) {
    const version = productModel.getProductVersion(item.product_id);
    if (version === null) return { success: false, error: `Product ${item.product_id} not found` };
    
    const updateResult = productModel.updateStockAtomic(item.product_id, item.quantity, version);
    if (!updateResult.success) return updateResult;
  }
  
  return orderModel.createOrderWithTransaction(input);
}
