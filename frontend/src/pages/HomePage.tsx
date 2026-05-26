import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import type { ApiError } from '../types/api';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

const HomePage: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<HealthData>('/health');
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err as ApiError);
        setHealthData(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary-700">IA Challenge</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to IA Challenge
          </h2>
          <p className="text-lg text-slate-600">
            Full-stack application with React, Node.js, and PostgreSQL
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Backend Status Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Backend Status
            </h3>
            {loading && (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-medium">Connection Error</p>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            )}
            {healthData && !loading && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-medium text-green-600">{healthData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Environment:</span>
                  <span className="font-medium">{healthData.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Uptime:</span>
                  <span className="font-medium">
                    {Math.round(healthData.uptime)}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Architecture Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Architecture
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                React + TypeScript
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Node.js + Express
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                PostgreSQL + reto_c Schema
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Layered Architecture
              </li>
            </ul>
          </div>

          {/* Getting Started Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Getting Started
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>1. Install dependencies</p>
              <p>2. Configure environment variables</p>
              <p>3. Start the backend server</p>
              <p>4. Start the frontend dev server</p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-12 card">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Technology Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-primary-700 mb-3">Frontend</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Vite</li>
                <li>• Tailwind CSS</li>
                <li>• React Router</li>
                <li>• Axios</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-700 mb-3">Backend</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Node.js</li>
                <li>• Express</li>
                <li>• TypeScript</li>
                <li>• PostgreSQL</li>
                <li>• pg (driver)</li>
                <li>• CORS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-700 mb-3">Database</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• PostgreSQL</li>
                <li>• reto_c schema</li>
                <li>• Connection pooling</li>
                <li>• UUID primary keys</li>
                <li>• Timestamps (created_at, updated_at)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
