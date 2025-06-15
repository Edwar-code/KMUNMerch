import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Avenue Fashion API',
      version: '1.0.0',
      description: 'API documentation for Avenue Fashion',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3000',
        description:
          process.env.NODE_ENV === 'production' ? 'Live server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the product.',
            },
            name: {
              type: 'string',
              description: 'The name of the product.',
            },
            price: {
              type: 'number',
              description: 'The price of the product.',
            },
            description: {
              type: 'string',
              description: 'The description of the product.',
            },
            categoryId: {
              type: 'string',
              description: 'The ID of the category the product belongs to.',
            },
            stock: {
              type: 'number',
              description: 'The stock quantity of the product.',
            },
            discount: {
              type: 'number',
              description: 'The discount on the product.',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'The images of the product.',
            },
            variations: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Variation',
              },
            },
          },
        },
        ProductInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the product.',
            },
            price: {
              type: 'number',
              description: 'The price of the product.',
            },
            description: {
              type: 'string',
              description: 'The description of the product.',
            },
            categoryId: {
              type: 'string',
              description: 'The ID of the category the product belongs to.',
            },
            stock: {
              type: 'number',
              description: 'The stock quantity of the product.',
            },
            discount: {
              type: 'number',
              description: 'The discount on the product.',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'The images of the product.',
            },
          },
          required: ['name', 'price', 'description', 'categoryId', 'stock'],
        },
        Variation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the variation.',
            },
            name: {
              type: 'string',
              description: 'The name of the variation.',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'The options for the variation.',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;