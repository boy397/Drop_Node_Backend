import { logger } from '@shared/utils/logger';

export class CartClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.CART_SERVICE_URL || 'http://localhost:5003';
  }

  // Fetch user's cart from Cart Service
  public async getCart(userId: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/internal/cart/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        const errText = await response.text();
        throw new Error(`Cart Service returned status ${response.status}: ${errText}`);
      }
      const body = (await response.json()) as { status: string; data: { cart: any } };
      return body.data.cart;
    } catch (error) {
      logger.error(`[CartClient] Failed to get cart for user ${userId}:`, error);
      throw error;
    }
  }

  // Clear user's cart after successful checkout
  public async clearCart(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/internal/cart/${userId}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errText = await response.text();
        logger.error(`[CartClient] Failed to clear cart: ${errText}`);
      }
    } catch (error) {
      logger.error(`[CartClient] Error calling clearCart for user ${userId}:`, error);
    }
  }
}

export class CatalogClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
  }

  // Reserve stock in Catalog Service (atomically)
  public async reserveStock(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/internal/products/reserve-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      let message = `Catalog Service returned status ${response.status}`;
      try {
        const body = (await response.json()) as { status: string; message: string };
        message = body.message || message;
      } catch (_) {}
      throw new Error(message);
    }
  }

  // Release stock back in Catalog Service (compensating action)
  public async releaseStock(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/internal/products/release-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errText = await response.text();
        logger.error(`[CatalogClient] Failed to release stock: ${errText}`);
      }
    } catch (error) {
      logger.error(`[CatalogClient] releaseStock error:`, error);
    }
  }
}

export const cartClient = new CartClient();
export const catalogClient = new CatalogClient();
