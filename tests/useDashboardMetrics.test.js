// Filename: useDashboardMetrics.test.js
// Instructions:
// - This file uses Jest and React Testing Library for testing a React hook.
// - To run these tests, install the following packages:
//     npm install --save-dev jest @testing-library/react-hooks @testing-library/react babel-jest
// - To run the tests, use the command:
//     npx jest useDashboardMetrics.test.js
// - Ensure your test environment supports React hooks (jsdom).
// - Mock '../services/dashboardService' as shown below.
// - Tests cover happy paths and edge cases as per guidelines.

import { renderHook, act } from '@testing-library/react-hooks'
import useDashboardMetrics from './useDashboardMetrics'

// Mock dashboardService
jest.mock('../services/dashboardService', () => ({
  getMetrics: jest.fn(),
}))

const dashboardService = require('../services/dashboardService')

/*
 * Happy Paths
 */

describe('useDashboardMetrics Hook - Happy Paths', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with null metrics, not loading, and no error', () => {
    dashboardService.getMetrics.mockResolvedValueOnce({ data: 42 })
    const { result } = renderHook(() => useDashboardMetrics())

    // After useEffect, fetchMetrics is called, so loading changes
    expect(result.current.metrics).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should fetch metrics successfully and set correct state', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce({ data: 100 })
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()

    expect(result.current.metrics).toBe(100)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should support refetch', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce({ data: 888 })
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe(888)

    dashboardService.getMetrics.mockResolvedValueOnce({ data: 999 })
    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.metrics).toBe(999)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle data as direct return (not nested)', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce(321)
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe(321)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})

/*
 * Edge Cases
 */

describe('useDashboardMetrics Hook - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle empty object response', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce({})
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle zero as response', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce(0)
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe(0)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle negative number as response', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce(-123)
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe(-123)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle maximum value (e.g., Number.MAX_SAFE_INTEGER)', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce(Number.MAX_SAFE_INTEGER)
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe(Number.MAX_SAFE_INTEGER)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle string instead of number', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce('invalid_string')
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBe('invalid_string')
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle Promise rejection (type error handling)', async () => {
    dashboardService.getMetrics.mockRejectedValueOnce(new Error('Network error'))
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())

    await waitForNextUpdate()
    expect(result.current.metrics).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Network error')
  })

  it('should handle thrown object instead of Error', async () => {
    dashboardService.getMetrics.mockImplementationOnce(() => {
      throw { message: 'Custom error', custom: true }
    })

    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())
    await waitForNextUpdate()

    expect(result.current.metrics).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Custom error')
  })

  it('should handle thrown error with no message', async () => {
    dashboardService.getMetrics.mockImplementationOnce(() => {
      throw {}
    })

    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())
    await waitForNextUpdate()

    expect(result.current.metrics).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle null returned from service', async () => {
    dashboardService.getMetrics.mockResolvedValueOnce(null)
    const { result, waitForNextUpdate } = renderHook(() => useDashboardMetrics())
    await waitForNextUpdate()
    expect(result.current.metrics).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})