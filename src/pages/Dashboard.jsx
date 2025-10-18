import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import StatCards from '../components/dashboard/StatCards';
import LatestVisits from '../components/dashboard/LatestVisits';
import QuickActions from '../components/dashboard/QuickActions';
import Alerts from '../components/dashboard/Alerts';

const Dashboard = () => {
  const { stats, latestVisits, alerts, loading, error, refetch } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={refetch}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to SIMS Dashboard</p>
        </div>

        {/* Stats Cards */}
        <StatCards stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Latest Visits */}
          <div className="lg:col-span-2">
            <LatestVisits visits={latestVisits} loading={loading} />
          </div>

          {/* Right Column - Compact cards */}
          <div className="space-y-4">
            <QuickActions />
            <Alerts alerts={alerts} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;