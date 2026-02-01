import React, { useState, useEffect } from 'react';
import { Sale, InventoryItem, AppSettings } from '../types';
import { calculateMetrics, formatCurrency } from '../utils/dataUtils';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsToolTip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    DollarSign,
    Package,
    TrendingUp,
    ArrowRight,
    Activity,
    Zap
} from 'lucide-react';
import Tooltip from './Tooltip';
import { itemsService } from '../services/supabaseClient';

interface DashboardProps {
    sales: Sale[];
    inventory: InventoryItem[];
    setActiveTab: (tab: string) => void;
    settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ sales, inventory, setActiveTab, settings }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState({
          totalRevenue: 0,
          totalProfit: 0,
          itemsSold: 0,
          itemsInStock: 0,
    });

    // Fetch items from Supabase on mount
    useEffect(() => {
          const loadItems = async () => {
                  try {
                            setLoading(true);
                            const allItems = await itemsService.getAllItems();
                            setItems(allItems);

                    // Calculate metrics from Supabase data
                    const soldItems = allItems.filter((i: any) => i.status === 'sold');
                            const availableItems = allItems.filter((i: any) => i.status === 'available');

                    const totalRevenue = soldItems.reduce((sum, item) => sum + (item.price || 0), 0);
                            const totalProfit = soldItems.reduce((sum, item) => sum + ((item.price || 0) - (item.cost || 0)), 0);

                    setMetrics({
                                totalRevenue,
                                totalProfit,
                                itemsSold: soldItems.length,
                                itemsInStock: availableItems.length,
                    });
                  } catch (err) {
                            setError('Failed to load dashboard data from Supabase');
                            console.error('Error loading dashboard:', err);
                  } finally {
                            setLoading(false);
                  }
          };

                  loadItems();
    }, []);

    // Chart data based on sales
    const chartData = sales.slice(-7).map((sale) => ({
          date: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profit: sale.profit,
    }));

    const dashboardCards = [
      {
              label: 'Total Revenue',
              value: formatCurrency(metrics.totalRevenue),
              icon: DollarSign,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
      },
      {
              label: 'Total Profit',
              value: formatCurrency(metrics.totalProfit),
              icon: TrendingUp,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
      },
      {
              label: 'Items Sold',
              value: metrics.itemsSold.toString(),
              icon: Package,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
      },
      {
              label: 'In Stock',
              value: metrics.itemsInStock.toString(),
              icon: Activity,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
      },
        ];

    return (
          <div className="space-y-8 pb-12">
            {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                              <button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900">✕</button>button>
                    </div>div>
                )}
          
            {loading && <p className="text-center text-slate-600">Loading dashboard data...</p>p>}
          
            {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboardCards.map((card, i) => {
                      const Icon = card.icon;
                      return (
                                    <div key={i} className={`${card.bgColor} p-6 rounded-2xl border border-slate-200`}>
                                                  <div className="flex items-center justify-between">
                                                                  <div>
                                                                                    <p className="text-slate-600 text-sm font-medium">{card.label}</p>p>
                                                                                    <p className="text-3xl font-black text-slate-900 mt-2">{card.value}</p>p>
                                                                  </div>div>
                                                                  <Icon className={`${card.color} w-12 h-12 opacity-20`} />
                                                  </div>div>
                                    </div>div>
                                  );
          })}
                </div>div>
          
            {/* Profit Trend Chart */}
            {chartData.length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                              <h2 className="text-2xl font-black text-slate-900 mb-6">Profit Trend (Last 7 Days)</h2>h2>
                              <ResponsiveContainer width="100%" height={300}>
                                          <AreaChart data={chartData}>
                                                        <defs>
                                                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                                        </linearGradient>linearGradient>
                                                        </defs>defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                        <XAxis dataKey="date" stroke="#64748b" />
                                                        <YAxis stroke="#64748b" />
                                                        <RechartsToolTip 
                                                                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                                        />
                                                        <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" />
                                          </AreaChart>AreaChart>
                              </ResponsiveContainer>ResponsiveContainer>
                    </div>div>
                )}
          
            {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                                    onClick={() => setActiveTab('inventory')}
                                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow text-left"
                                  >
                                  <Package className="text-purple-600 w-8 h-8 mb-3" />
                                  <h3 className="text-xl font-black text-slate-900">Manage Inventory</h3>h3>
                                  <p className="text-slate-600 text-sm mt-1">Add new items or update existing ones</p>p>
                                  <div className="flex items-center text-purple-600 font-bold mt-4">
                                              Go to Inventory
                                              <ArrowRight size={16} className="ml-2" />
                                  </div>div>
                        </button>button>
                
                        <button
                                    onClick={() => setActiveTab('sales')}
                                    className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-shadow text-left"
                                  >
                                  <DollarSign className="text-green-600 w-8 h-8 mb-3" />
                                  <h3 className="text-xl font-black text-slate-900">Record a Sale</h3>h3>
                                  <p className="text-slate-600 text-sm mt-1">Track your sales and profits</p>p>
                                  <div className="flex items-center text-green-600 font-bold mt-4">
                                              Go to Sales
                                              <ArrowRight size={16} className="ml-2" />
                                  </div>div>
                        </button>button>
                </div>div>
          
            {/* Recent Sales */}
            {sales.length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                              <h2 className="text-2xl font-black text-slate-900 mb-6">Recent Sales</h2>h2>
                              <div className="space-y-3">
                                {sales.slice(0, 5).map((sale, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                    <div>
                                                                      <p className="font-semibold text-slate-900">{sale.salePrice ? formatCurrency(sale.salePrice) : 'N/A'}</p>p>
                                                                      <p className="text-sm text-slate-500">{new Date(sale.date).toLocaleDateString()}</p>p>
                                                    </div>div>
                                                    <p className="font-bold text-green-600">{formatCurrency(sale.profit)}</p>p>
                                    </div>div>
                                  ))}
                              </div>div>
                    </div>div>
                )}
          
            {/* Empty State */}
            {metrics.itemsInStock === 0 && !loading && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                              <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                              <p className="text-slate-600 font-medium">No inventory items yet. Start by adding items to get started!</p>p>
                    </div>div>
                )}
          </div>div>
        );
};

export default Dashboard;</div>
