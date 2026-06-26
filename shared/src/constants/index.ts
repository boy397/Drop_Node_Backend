export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  COD = 'cod',
}

export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  PROMO = 'promo',
  SYSTEM = 'system',
}

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}
