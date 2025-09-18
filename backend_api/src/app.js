require('dotenv').config();
const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

/**
 * Express application initialization and middleware registration.
 * Exposes the API routes and Swagger docs. Reads configuration from environment variables.
 * Swagger docs available at /docs. Use "Authorize" button with Bearer token for protected endpoints.
 * OpenAPI JSON is available at /openapi.json and a usage help at /docs/help.
 */
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);

// Helper to build a dynamic spec with correct server URL based on request
function buildDynamicSpec(req) {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  return {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
        description: 'Dynamic server URL (based on incoming request)',
      },
    ],
    tags: swaggerSpec.tags || [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Books', description: 'Endpoints for browsing books' },
      { name: 'Orders', description: 'Endpoints for managing orders' },
    ],
  };
}

// Serve Swagger UI with dynamic spec
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const dynamicSpec = buildDynamicSpec(req);
  swaggerUi.setup(dynamicSpec, { explorer: true })(req, res, next);
});

// Serve OpenAPI JSON dynamically (useful for frontend codegen)
app.get('/openapi.json', (req, res) => {
  const dynamicSpec = buildDynamicSpec(req);
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(dynamicSpec, null, 2));
});

// Lightweight help page describing docs and WebSocket usage (if any)
app.get('/docs/help', (req, res) => {
  return res.status(200).json({
    message: 'API Documentation',
    docs_url: '/docs',
    openapi_url: '/openapi.json',
    notes:
      'Use the Authorize button in Swagger UI to add a Bearer token for protected endpoints. ' +
      'Endpoints are grouped by tags: Auth, Books, and Orders.',
  });
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
