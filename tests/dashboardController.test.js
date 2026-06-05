// Filename: dashboardController.test.js
// 
// Instructions:
// 1. Install dev dependencies (jest):
//      npm install --save-dev jest
// 2. In your package.json, ensure you have something like:
//      "scripts": { "test": "jest" }
// 3. Place this test file in your tests/ folder or __tests__/ as appropriate.
// 4. Run the tests:
//      npm test
//
// Note: Mocks InitiativeRepository. If module paths vary, update the require paths accordingly.

/* eslint-disable max-lines-per-function */
const { 
  getMetrics,
  getStatusCounts,
  getPriorityDistribution,
  getOverdueCount,
  getAvgTimeToStart
} = require('../controllers/dashboardController'); // <-- Update for actual path

const repository = require('../models/InitiativeRepository');

jest.mock('../models/InitiativeRepository');

describe('Dashboard Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // Happy Paths
  describe('Happy Paths', () => {
    test('getMetrics returns all KPIs successfully', async () => {
      repository.countTotal.mockResolvedValue(42);
      repository.countByEstado.mockResolvedValue({ open: 30, closed: 12 });
      repository.countOverduePending.mockResolvedValue(7);
      repository.countByPrioridad.mockResolvedValue({ high: 10, low: 32 });
      repository.avgDaysToStart.mockResolvedValue(4);
      repository.completedPercentage.mockResolvedValue(75);

      await getMetrics(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 42,
          byEstado: { open: 30, closed: 12 },
          overduePending: 7,
          byPrioridad: { high: 10, low: 32 },
          avgDaysToStart: 4,
          completedPercentage: 75,
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('getStatusCounts returns estado grouping', async () => {
      repository.countByEstado.mockResolvedValue({ open: 5, closed: 2 });
      await getStatusCounts(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { open: 5, closed: 2 } });
      expect(next).not.toHaveBeenCalled();
    });

    test('getPriorityDistribution returns prioridad grouping', async () => {
      repository.countByPrioridad.mockResolvedValue({ high: 5, medium: 3, low: 0 });
      await getPriorityDistribution(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { high: 5, medium: 3, low: 0 } });
      expect(next).not.toHaveBeenCalled();
    });

    test('getOverdueCount returns overduePending count', async () => {
      repository.countOverduePending.mockResolvedValue(1);
      await getOverdueCount(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { count: 1 } });
      expect(next).not.toHaveBeenCalled();
    });

    test('getAvgTimeToStart returns average days to start', async () => {
      repository.avgDaysToStart.mockResolvedValue(2.5);
      await getAvgTimeToStart(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { avgDays: 2.5 } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('getMetrics handles zero values correctly', async () => {
      repository.countTotal.mockResolvedValue(0);
      repository.countByEstado.mockResolvedValue({});
      repository.countOverduePending.mockResolvedValue(0);
      repository.countByPrioridad.mockResolvedValue({});
      repository.avgDaysToStart.mockResolvedValue(0);
      repository.completedPercentage.mockResolvedValue(0);

      await getMetrics(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 0,
          byEstado: {},
          overduePending: 0,
          byPrioridad: {},
          avgDaysToStart: 0,
          completedPercentage: 0,
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('getOverdueCount returns zero for no overdue pending', async () => {
      repository.countOverduePending.mockResolvedValue(0);
      await getOverdueCount(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { count: 0 } });
    });

    test('getAvgTimeToStart returns zero when no initiatives present', async () => {
      repository.avgDaysToStart.mockResolvedValue(0);
      await getAvgTimeToStart(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { avgDays: 0 } });
    });

    test('getMetrics with extremely large numbers (max int)', async () => {
      const max = Number.MAX_SAFE_INTEGER;
      repository.countTotal.mockResolvedValue(max);
      repository.countByEstado.mockResolvedValue({ open: max, closed: max });
      repository.countOverduePending.mockResolvedValue(max);
      repository.countByPrioridad.mockResolvedValue({ high: max });
      repository.avgDaysToStart.mockResolvedValue(max);
      repository.completedPercentage.mockResolvedValue(100);

      await getMetrics(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: max,
          byEstado: { open: max, closed: max },
          overduePending: max,
          byPrioridad: { high: max },
          avgDaysToStart: max,
          completedPercentage: 100,
        }
      });
    });

    test('getStatusCounts handles non-integer and negative values gracefully', async () => {
      repository.countByEstado.mockResolvedValue({ open: -5, closed: 3.14 });
      await getStatusCounts(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { open: -5, closed: 3.14 } });
    });

    test('getMetrics handles type errors gracefully', async () => {
      // Simulate type errors (repository returns strings instead of numbers)
      repository.countTotal.mockResolvedValue("not-a-number");
      repository.countByEstado.mockResolvedValue("should-be-an-object");
      repository.countOverduePending.mockResolvedValue("Oops");
      repository.countByPrioridad.mockResolvedValue("fail");
      repository.avgDaysToStart.mockResolvedValue("NaN");
      repository.completedPercentage.mockResolvedValue("one hundred");

      await getMetrics(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: "not-a-number",
          byEstado: "should-be-an-object",
          overduePending: "Oops",
          byPrioridad: "fail",
          avgDaysToStart: "NaN",
          completedPercentage: "one hundred",
        }
      });
    });

    test('getMetrics handles thrown errors', async () => {
      const error = new Error('Test error');
      repository.countTotal.mockRejectedValue(error);
      // The rest will not be called because the first promise fails

      await getMetrics(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('getOverdueCount handles repository errors', async () => {
      const error = new Error('Repo error');
      repository.countOverduePending.mockRejectedValue(error);
      await getOverdueCount(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('getAvgTimeToStart handles non-number types', async () => {
      repository.avgDaysToStart.mockResolvedValue("a string");
      await getAvgTimeToStart(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { avgDays: "a string" } });
    });
  });
});