/**
 * Test utilities with custom render and providers
 */

import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssortmentStore } from '@/features/assortment/store/use-assortment-store'
import type { AssortmentTab, BrandTier, OptimizationConstraints } from '@/features/assortment/types'

// =============================================================================
// Query Client for Testing
// =============================================================================

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// =============================================================================
// Test Providers
// =============================================================================

interface TestProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
}

export function TestProviders({ children, queryClient }: TestProvidersProps): ReactElement {
  const client = queryClient || createTestQueryClient()

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

// =============================================================================
// Custom Render
// =============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialStoreState?: Partial<{
    selectedStore: string | null
    selectedSubcategories: string[]
    selectedBrandTiers: BrandTier[]
    activeTab: AssortmentTab
    optimizationConstraints: OptimizationConstraints
    simulationConfig: { numTrials: number; demandCv: number }
    isSidebarCollapsed: boolean
  }>
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient = createTestQueryClient(), initialStoreState, ...renderOptions } = options

  // Reset and optionally initialize store state
  if (initialStoreState) {
    const store = useAssortmentStore.getState()
    store.reset()

    if (initialStoreState.selectedStore !== undefined) {
      store.setSelectedStore(initialStoreState.selectedStore)
    }
    if (initialStoreState.selectedSubcategories) {
      store.setSubcategories(initialStoreState.selectedSubcategories)
    }
    if (initialStoreState.selectedBrandTiers) {
      store.setBrandTiers(initialStoreState.selectedBrandTiers)
    }
    if (initialStoreState.activeTab) {
      store.setActiveTab(initialStoreState.activeTab)
    }
    if (initialStoreState.optimizationConstraints) {
      store.setConstraints(initialStoreState.optimizationConstraints)
    }
    if (initialStoreState.simulationConfig) {
      store.setSimulationConfig(initialStoreState.simulationConfig)
    }
  }

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  )

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })

  return {
    ...result,
    queryClient,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }

// =============================================================================
// Store Helpers
// =============================================================================

/**
 * Reset the Zustand store to initial state
 */
export function resetStore(): void {
  useAssortmentStore.getState().reset()
}

/**
 * Get current store state
 */
export function getStoreState() {
  return useAssortmentStore.getState()
}

/**
 * Set store state directly for testing
 */
export function setStoreState(state: Parameters<typeof useAssortmentStore.setState>[0]) {
  useAssortmentStore.setState(state)
}

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Wait for element to have specific text content
 */
export async function waitForText(
  container: HTMLElement,
  text: string | RegExp
): Promise<HTMLElement> {
  const { findByText } = await import('@testing-library/react')
  return findByText(container, text)
}

/**
 * Check if element has specific aria attributes
 */
export function hasAriaAttribute(
  element: HTMLElement,
  attribute: string,
  value?: string
): boolean {
  const attrValue = element.getAttribute(`aria-${attribute}`)
  if (value !== undefined) {
    return attrValue === value
  }
  return attrValue !== null
}

// =============================================================================
// Mock Data Helpers
// =============================================================================

/**
 * Generate random ID
 */
export function generateId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Create a mock function that tracks calls
 */
export function createMockFn<T extends (...args: unknown[]) => unknown>(): T & {
  calls: Parameters<T>[]
  lastCall: Parameters<T> | undefined
  reset: () => void
} {
  const calls: Parameters<T>[] = []

  const fn = ((...args: unknown[]) => {
    calls.push(args as Parameters<T>)
    return undefined
  }) as T & {
    calls: Parameters<T>[]
    lastCall: Parameters<T> | undefined
    reset: () => void
  }

  Object.defineProperty(fn, 'calls', {
    get: () => calls,
  })

  Object.defineProperty(fn, 'lastCall', {
    get: () => calls[calls.length - 1],
  })

  fn.reset = () => {
    calls.length = 0
  }

  return fn
}

// =============================================================================
// Number Formatting Assertions
// =============================================================================

/**
 * Check if a string contains a formatted currency value
 */
export function containsCurrency(text: string): boolean {
  return /\$[\d,]+(\.\d{2})?/.test(text)
}

/**
 * Check if a string contains a percentage
 */
export function containsPercentage(text: string): boolean {
  return /[\d.]+%/.test(text)
}

/**
 * Parse formatted currency string to number
 */
export function parseCurrency(text: string): number {
  const match = text.match(/\$?([\d,]+(?:\.\d{2})?)/)
  if (!match) return NaN
  return parseFloat(match[1].replace(/,/g, ''))
}

// =============================================================================
// Async Helpers
// =============================================================================

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Condition not met within timeout')
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Create a deferred promise for testing async behavior
 */
export function createDeferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
} {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

// =============================================================================
// Chart Testing Helpers
// =============================================================================

/**
 * Get all rendered chart elements (for recharts)
 */
export function getChartElements(container: HTMLElement) {
  return {
    svg: container.querySelector('svg'),
    bars: container.querySelectorAll('.recharts-bar-rectangle'),
    lines: container.querySelectorAll('.recharts-line'),
    areas: container.querySelectorAll('.recharts-area'),
    legends: container.querySelectorAll('.recharts-legend-item'),
    tooltips: container.querySelectorAll('.recharts-tooltip'),
    xAxis: container.querySelector('.recharts-xAxis'),
    yAxis: container.querySelector('.recharts-yAxis'),
  }
}

// =============================================================================
// Form Testing Helpers
// =============================================================================

/**
 * Fill a form field by label
 */
export async function fillField(
  container: HTMLElement,
  labelText: string,
  value: string
): Promise<void> {
  const { screen } = await import('@testing-library/react')
  const { default: userEvent } = await import('@testing-library/user-event')

  const input = screen.getByLabelText(labelText)
  await userEvent.clear(input)
  await userEvent.type(input, value)
}

/**
 * Submit a form
 */
export async function submitForm(container: HTMLElement, buttonText = 'Submit'): Promise<void> {
  const { screen } = await import('@testing-library/react')
  const { default: userEvent } = await import('@testing-library/user-event')

  const button = screen.getByRole('button', { name: buttonText })
  await userEvent.click(button)
}
