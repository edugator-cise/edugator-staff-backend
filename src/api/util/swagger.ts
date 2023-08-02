import { Request, Response, Express } from 'express';
import * as swaggerJSdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { version } from '../../../package.json';

const swaggerDefinition: swaggerJSdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version: version
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/api/routes/v1/health.routes.ts']
};

const swaggerSpec = swaggerJSdoc(swaggerDefinition);

export function swaggerDocs(app: Express, _port: number) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
