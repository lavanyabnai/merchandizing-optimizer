/**
 * MSW request handlers for API mocking
 */

import { http, HttpResponse, delay } from 'msw'
import {
  mockProducts,
  mockStores,
  mockStoreOptions,
  mockSales,
  mockSubcategories,
  mockDashboardMetrics,
  mockOptimizationResult,
  mockSimulationResult,
  mockClusteringResult,
  mockCDTData,
} from './data'

const API_BASE = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || 'http://localhost:8000'

// =============================================================================
// Success Handlers
// =============================================================================

export const handlers = [
  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/products`, async ({ request }) => {
    await delay(50)
    const url = new URL(request.url)
    const subcategory = url.searchParams.get('subcategory')
    const brandTier = url.searchParams.get('brandTier')

    let filtered = [...mockProducts]

    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory)
    }

    if (brandTier) {
      filtered = filtered.filter((p) => p.brandTier === brandTier)
    }

    return HttpResponse.json(filtered)
  }),

  http.get(`${API_BASE}/api/v1/data/products/:id`, async ({ params }) => {
    await delay(50)
    const product = mockProducts.find((p) => p.id === params.id)
    if (!product) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(product)
  }),

  http.get(`${API_BASE}/api/v1/data/subcategories`, async () => {
    await delay(50)
    return HttpResponse.json(mockSubcategories)
  }),

  // -------------------------------------------------------------------------
  // Stores
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/stores`, async () => {
    await delay(50)
    return HttpResponse.json(mockStores)
  }),

  http.get(`${API_BASE}/api/v1/data/store-options`, async () => {
    await delay(50)
    return HttpResponse.json(mockStoreOptions)
  }),

  // -------------------------------------------------------------------------
  // Sales
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/sales`, async ({ request }) => {
    await delay(50)
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')
    const productId = url.searchParams.get('productId')

    let filtered = [...mockSales]

    if (storeId) {
      filtered = filtered.filter((s) => s.storeId === storeId)
    }

    if (productId) {
      filtered = filtered.filter((s) => s.productId === productId)
    }

    return HttpResponse.json(filtered)
  }),

  // -------------------------------------------------------------------------
  // Dashboard
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/dashboard-metrics`, async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')

    // Return store-specific or aggregate metrics
    if (storeId) {
      return HttpResponse.json({
        ...mockDashboardMetrics,
        totalRevenue: mockDashboardMetrics.totalRevenue / 25,
        totalProfit: mockDashboardMetrics.totalProfit / 25,
        totalUnits: mockDashboardMetrics.totalUnits / 25,
        storeCount: 1,
      })
    }

    return HttpResponse.json(mockDashboardMetrics)
  }),

  // Dashboard metrics (alternative endpoint)
  http.get(`${API_BASE}/api/v1/data/metrics`, async ({ request }) => {
    await delay(50)
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')

    if (storeId) {
      return HttpResponse.json({
        ...mockDashboardMetrics,
        totalRevenue: mockDashboardMetrics.totalRevenue / 25,
        totalProfit: mockDashboardMetrics.totalProfit / 25,
        totalUnits: mockDashboardMetrics.totalUnits / 25,
        storeCount: 1,
      })
    }

    return HttpResponse.json(mockDashboardMetrics)
  }),

  // -------------------------------------------------------------------------
  // Optimization
  // -------------------------------------------------------------------------
  http.post(`${API_BASE}/api/v1/optimize/run`, async ({ request }) => {
    await delay(200)
    const body = await request.json()

    return HttpResponse.json({
      ...mockOptimizationResult,
      runId: `opt-${Date.now()}`,
      constraints: body,
      createdAt: new Date().toISOString(),
    })
  }),

  http.get(`${API_BASE}/api/v1/optimize/:runId`, async ({ params }) => {
    await delay(50)
    return HttpResponse.json({
      ...mockOptimizationResult,
      runId: params.runId,
    })
  }),

  http.get(`${API_BASE}/api/v1/optimize/history`, async () => {
    await delay(50)
    return HttpResponse.json([
      {
        runId: 'opt-001',
        storeId: 'store-001',
        status: 'completed',
        profitLiftPct: 8.5,
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        runId: 'opt-002',
        storeId: 'store-002',
        status: 'completed',
        profitLiftPct: 6.2,
        createdAt: '2024-01-14T14:20:00Z',
      },
      {
        runId: 'opt-003',
        storeId: 'store-001',
        status: 'failed',
        createdAt: '2024-01-13T09:15:00Z',
      },
    ])
  }),

  http.delete(`${API_BASE}/api/v1/optimize/:runId`, async () => {
    await delay(50)
    return new HttpResponse(null, { status: 204 })
  }),

  // -------------------------------------------------------------------------
  // Simulation
  // -------------------------------------------------------------------------
  http.post(`${API_BASE}/api/v1/simulate/run`, async ({ request }) => {
    await delay(300)
    const body = await request.json()

    return HttpResponse.json({
      ...mockSimulationResult,
      runId: `sim-${Date.now()}`,
      scenarioType: body.scenarioType,
      parameters: body.parameters,
      config: body.config || mockSimulationResult.config,
      createdAt: new Date().toISOString(),
    })
  }),

  http.get(`${API_BASE}/api/v1/simulate/:runId`, async ({ params }) => {
    await delay(50)
    return HttpResponse.json({
      ...mockSimulationResult,
      runId: params.runId,
    })
  }),

  // -------------------------------------------------------------------------
  // Clustering
  // -------------------------------------------------------------------------
  http.post(`${API_BASE}/api/v1/cluster/run`, async ({ request }) => {
    await delay(200)
    const body = await request.json()

    return HttpResponse.json({
      ...mockClusteringResult,
      runId: `cluster-${Date.now()}`,
      method: body.method,
      nClusters: body.nClusters || 3,
      featuresUsed: body.features || mockClusteringResult.featuresUsed,
      createdAt: new Date().toISOString(),
    })
  }),

  http.get(`${API_BASE}/api/v1/cluster/:runId`, async ({ params }) => {
    await delay(50)
    return HttpResponse.json({
      ...mockClusteringResult,
      runId: params.runId,
    })
  }),

  // -------------------------------------------------------------------------
  // CDT
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/cdt`, async () => {
    await delay(100)
    return HttpResponse.json(mockCDTData)
  }),

  // -------------------------------------------------------------------------
  // Planogram
  // -------------------------------------------------------------------------
  http.get(`${API_BASE}/api/v1/data/planogram`, async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')

    const store = storeId
      ? mockStores.find((s) => s.id === storeId) || mockStores[0]
      : mockStores[0]

    // Generate planogram layout based on store
    const shelves = Array.from({ length: store.numShelves }, (_, shelfIndex) => ({
      shelfId: `shelf-${shelfIndex + 1}`,
      shelfNumber: shelfIndex + 1,
      widthInches: store.shelfWidthInches,
      products: mockProducts.slice(0, 5).map((product, productIndex) => ({
        ...product,
        facings: Math.max(1, Math.floor(Math.random() * 4) + 1),
        position: productIndex * 4,
        shelfPosition: shelfIndex + 1,
      })),
    }))

    return HttpResponse.json({
      storeId: store.id,
      storeName: store.name,
      shelves,
      totalFacings: store.totalFacings,
      utilizationPct: 0.85,
    })
  }),
]

// =============================================================================
// Error Handlers (for error scenario testing)
// =============================================================================

export const errorHandlers = {
  serverError: http.get(`${API_BASE}/api/v1/data/products`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  networkError: http.get(`${API_BASE}/api/v1/data/products`, () => {
    return HttpResponse.error()
  }),

  notFound: http.get(`${API_BASE}/api/v1/data/products/:id`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  validationError: http.post(`${API_BASE}/api/v1/optimize/run`, () => {
    return HttpResponse.json(
      {
        detail: [
          {
            loc: ['body', 'totalFacings'],
            msg: 'Value must be greater than 0',
            type: 'value_error',
          },
        ],
      },
      { status: 422 }
    )
  }),

  slowResponse: http.get(`${API_BASE}/api/v1/data/dashboard-metrics`, async () => {
    await delay(5000)
    return HttpResponse.json(mockDashboardMetrics)
  }),

  optimizationFailed: http.post(`${API_BASE}/api/v1/optimize/run`, () => {
    return HttpResponse.json({
      ...mockOptimizationResult,
      status: 'failed',
      productAllocations: [],
      spaceAllocations: [],
    })
  }),

  simulationFailed: http.post(`${API_BASE}/api/v1/simulate/run`, () => {
    return HttpResponse.json({
      ...mockSimulationResult,
      status: 'failed',
      trialsCompleted: 0,
    })
  }),
}
