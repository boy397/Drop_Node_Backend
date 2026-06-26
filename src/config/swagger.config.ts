import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API Service',
      version: '1.0.0',
      description: 'Enterprise-grade E-Commerce API documentation. Built with Express, TypeScript, MongoDB, and Redis.',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Parse Swagger doc blocks in our source routes and compiled JS routes
  apis: ['./src/routes/*.ts', './src/app.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
