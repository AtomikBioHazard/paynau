import db from './database';
import type { Product, ProductInput, PaginatedResult, ServiceResult } from '@/types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function getAllProducts(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): PaginatedResult<Product> {
  const offset = (page - 1) * limit;
  
  const stmt = db.prepare(`
    SELECT * FROM products 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM products');
  
  const products = stmt.all(limit, offset) as Product[];
  const { total } = countStmt.get() as { total: number };
  
  return {
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getProductById(id: number): ServiceResult<Product> {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const product = stmt.get(id) as Product | undefined;
  
  if (!product) return { success: false, error: 'Product not found' };
  return { success: true, data: product };
}

export function getProductByName(name: string): ServiceResult<Product> {
  const stmt = db.prepare('SELECT * FROM products WHERE name = ? COLLATE NOCASE');
  const product = stmt.get(name) as Product | undefined;
  
  if (!product) return { success: false, error: 'Product not found' };
  return { success: true, data: product };
}

export function createProduct(input: ProductInput): ServiceResult<Product> {
  const existing = db.prepare('SELECT id FROM products WHERE name = ? COLLATE NOCASE').get(input.name);
  if (existing) return { success: false, error: 'Product with this name already exists' };
  
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, stock)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(input.name, input.description || null, input.price, input.stock);
  return getProductById(result.lastInsertRowid as number);
}

export function updateProduct(id: number, input: Partial<ProductInput>): ServiceResult<Product> {
  const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
  if (!current) return { success: false, error: 'Product not found' };
  
  if (input.name && input.name !== current.name) {
    const existing = db.prepare('SELECT id FROM products WHERE name = ? COLLATE NOCASE AND id != ?').get(input.name, id);
    if (existing) return { success: false, error: 'Product with this name already exists' };
  }
  
  const stmt = db.prepare(`
    UPDATE products 
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(input.name, input.description, input.price, input.stock, id);
  return getProductById(id);
}

export function deleteProduct(id: number): ServiceResult<void> {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  const result = stmt.run(id);
  
  if (result.changes === 0) return { success: false, error: 'Product not found' };
  return { success: true };
}

export function updateStockAtomic(productId: number, quantity: number, expectedVersion: number): ServiceResult<void> {
  const stmt = db.prepare(`
    UPDATE products 
    SET stock = stock - ?, version = version + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND version = ? AND stock >= ?
  `);
  
  const result = stmt.run(quantity, productId, expectedVersion, quantity);
  
  if (result.changes === 0) {
    const product = db.prepare('SELECT stock, version FROM products WHERE id = ?').get(productId) as { stock: number; version: number } | undefined;
    if (!product) return { success: false, error: 'Product not found' };
    if (product.version !== expectedVersion) return { success: false, error: 'CONFLICT: Product was modified by another request' };
    if (product.stock < quantity) return { success: false, error: 'Insufficient stock' };
    return { success: false, error: 'Update failed' };
  }
  
  return { success: true };
}

export function getProductVersion(productId: number): number | null {
  const stmt = db.prepare('SELECT version FROM products WHERE id = ?');
  const row = stmt.get(productId) as { version: number } | undefined;
  return row?.version ?? null;
}
