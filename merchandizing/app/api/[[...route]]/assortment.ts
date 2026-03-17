/**
 * Assortment Optimizer API Gateway
 *
 * This module proxies requests to the Assortment Optimizer microservice.
 */

import { Hono } from 'hono';

// Get the microservice URL from environment
const ASSORTMENT_SERVICE_URL = process.env.ASSORTMENT_SERVICE_URL || 'http://localhost:8000';

// Create Hono app for assortment routes
const app = new Hono()

  // Health check proxy (no auth required)
  .get('/health', async (c) => {
    try {
      const response = await fetch(`${ASSORTMENT_SERVICE_URL}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      console.error('Assortment service health check failed:', error);
      return c.json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Assortment Optimizer service is unavailable',
          },
        },
        503
      );
    }
  })

  // Catch-all proxy for all other routes
  .all('/*', async (c) => {
    // Build the target URL
    const path = c.req.path.replace('/api/assortment', '');
    const url = new URL(c.req.url);
    const targetUrl = `${ASSORTMENT_SERVICE_URL}/api/v1${path}${url.search}`;

    try {
      // Get the request body for non-GET requests
      let body: string | undefined;
      if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
        try {
          body = await c.req.text();
        } catch {
          body = undefined;
        }
      }

      // Forward the request to the microservice
      const response = await fetch(targetUrl, {
        method: c.req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Forward the original Authorization header if present
          ...(c.req.header('Authorization') && {
            Authorization: c.req.header('Authorization')!,
          }),
        },
        body: body || undefined,
      });

      // Get response data
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Return the response with original status code
      if (typeof data === 'string') {
        return c.text(data, response.status as any);
      }
      return c.json(data, response.status as any);
    } catch (error) {
      console.error('Assortment service proxy error:', error);

      // Check if it's a connection error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return c.json(
          {
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Assortment Optimizer service is unavailable',
              details: {
                service_url: ASSORTMENT_SERVICE_URL,
              },
            },
          },
          503
        );
      }

      return c.json(
        {
          error: {
            code: 'PROXY_ERROR',
            message: 'Failed to proxy request to Assortment Optimizer service',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        },
        502
      );
    }
  });

export default app;
