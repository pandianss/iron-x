import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IRON-X Discipline Engine API',
            version: '1.0.0',
            description: 'API Documentation for the IRON-X Discipline Enforcement System',
            contact: {
                name: 'System Integrity',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/app.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
