'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: {
    dailyOrders: Array<{
      date: string;
      count: number;
      revenue: number;
    }>;
    orderStatusDistribution: Record<string, number>;
    topPackages: Array<{
      package_id: string;
      total_quantity: number;
      total_revenue: number;
    }>;
  };
}

export function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  const statusColors = {
    pending: '#f59e0b',
    verified: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  // Calculate percentages for status distribution
  const totalOrders = Object.values(stats.orderStatusDistribution).reduce((sum, count) => sum + count, 0);
  const statusPercentages = Object.entries(stats.orderStatusDistribution).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    color: statusColors[status as keyof typeof statusColors] || '#6b7280'
  }));

  // Get last 7 days for daily orders chart
  const last7Days = stats.dailyOrders.slice(0, 7).reverse();
  const maxRevenue = Math.max(...last7Days.map(day => day.revenue), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Orders Chart */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6" />
            <span>Daily Orders (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {last7Days.map((day, index) => (
              <div key={day.date} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{day.count} orders</span>
                    <span className="text-gray-600 ml-2">৳{day.revenue}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 5) : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {last7Days.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No order data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <PieChart className="h-6 w-6" />
            <span>Order Status Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {statusPercentages.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="capitalize font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{item.count}</span>
                    <span className="text-gray-600 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.percentage}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {statusPercentages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No status data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Selling Packages */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm lg:col-span-2">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6" />
            <span>Top Selling Packages</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topPackages.map((pkg, index) => (
              <div key={pkg.package_id} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-900">{pkg.package_id}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity Sold:</span>
                    <span className="font-bold text-emerald-600">{pkg.total_quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="font-bold text-emerald-600">৳{pkg.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Price:</span>
                    <span className="font-medium text-gray-700">
                      ৳{pkg.total_quantity > 0 ? Math.round(pkg.total_revenue / pkg.total_quantity) : 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {stats.topPackages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No package sales data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}