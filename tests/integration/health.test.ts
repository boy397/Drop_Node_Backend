import request from 'supertest';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5000';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5003';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5004';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005';
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:5006';

describe('Health Check Integration Tests (E2E)', () => {
  it('should verify the API Gateway is online and healthy', async () => {
    const res = await request(GATEWAY_URL)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('service', 'api-gateway');
  });

  const services = [
    { name: 'Auth Service', url: AUTH_SERVICE_URL, serviceName: 'auth-service' },
    { name: 'Catalog Service', url: CATALOG_SERVICE_URL, serviceName: 'catalog-service' },
    { name: 'Cart Service', url: CART_SERVICE_URL, serviceName: 'cart-service' },
    { name: 'Order Service', url: ORDER_SERVICE_URL, serviceName: 'order-service' },
    { name: 'Notification Service', url: NOTIFICATION_SERVICE_URL, serviceName: 'notification-service' },
    { name: 'Content Service', url: CONTENT_SERVICE_URL, serviceName: 'content-service' },
  ];

  services.forEach((service) => {
    it(`should verify ${service.name} is online and connected to its database`, async () => {
      const res = await request(service.url)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('service', service.serviceName);
      expect(res.body).toHaveProperty('database', 'healthy');
    });
  });
});
