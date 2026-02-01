import React, { useState, useEffect } from 'react';
import { Sale, Expense } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { Download, FileBarChart, Calculator, AlertCircle } from 'lucide-react';
import { itemsService } from '../services/supabaseClient';

interface TaxReportsProps {
    sales: Sale[];
    expenses: Expense[];
}

const TaxReports: React.FC<TaxReportsProps> = ({ sales, expenses }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState({
          grossReceipts: 0,
          cogs: 0,
          platformFees: 0,
          shippingCosts: 0,
          expensesByCategory: {} as Record<string, number>,
          totalExpenses: 0,
          netProfit: 0,
    });

    // Fetch items from Supabase and calculate tax metrics
    useEffect(() => {
          const loadReportData = async () => {
                  try {
                            setLoading(true);
                            const allItems = await itemsService.getAllItems();
                            setItems(allItems);

                    // Calculate metrics from Supabase data
                    const soldItems = allItems.filter((i: any) => i.status === 'sold');
                            const grossReceipts = soldItems.reduce((sum, item) => sum + (item.price || 0), 0);
                            const cogs = soldItems.reduce((sum, item) => sum + (item.cost || 0), 0);

                    // Calculate expenses by category
                    const expensesByCategory: Record<string, number> = {};
                            let totalExpenses = 0;
                            expenses.forEach((e) => {
                                        if (e.category) {
                                                      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
                                        }
                                        totalExpenses += e.amount;
                            });

                    const platformFees = sales.reduce((sum, s) => sum + (s.fees || 0), 0);
                            const shippingCosts = sales.reduce((sum, s) => sum + (s.shippingPaid || 0), 0);
                            const netProfit = grossReceipts - cogs - platformFees - shippingCosts - totalExpenses;

                    setReportData({
                                grossReceipts,
                                cogs,
                                platformFees,
                                shippingCosts,
                                expensesByCategory,
                                totalExpenses,
                                netProfit,
                    });
                  } catch (err) {
                            setError('Failed to load report data from Supabase');
                            console.error('Error loading report:', err);
                  } finally {
                            setLoading(false);
                  }
          };

                  loadReportData();
    }, [expenses]);

    const downloadReport = () => {
          const reportContent = `
          TAX REPORT - ${new Date().toLocaleDateString()}
          ========================================
          Gross Receipts: ${formatCurrency(reportData.grossReceipts)}
          Cost of Goods Sold: ${formatCurrency(reportData.cogs)}
          Platform Fees: ${formatCurrency(reportData.platformFees)}
          Shipping Costs: ${formatCurrency(reportData.shippingCosts)}
          Total Expenses: ${formatCurrency(reportData.totalExpenses)}
          Net Profit: ${formatCurrency(reportData.netProfit)}
              `.trim();

          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
          element.setAttribute('download', `tax-report-${new Date().getTime()}.txt`);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
    };

    return (
          <div className="space-y-8 pb-12">
                <div className="flex items-center justify-between">
                        <div>
                                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tax Reports</h1>h1>
                                  <p className="text-slate-500 font-medium">View your tax metrics from Supabase data</p>p>
                        </div>div>
                        <button
                                    onClick={downloadReport}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                  >
                                  <Download size={18} />
                                  Download Report
                        </button>button>
                </div>div>
          
            {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                              <button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900">✕</button>button>
                    </div>div>
                )}
          
            {loading && <p className="text-center text-slate-600">Loading report data from Supabase...</p>p>}
          
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gross Receipts */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                                  <div className="flex items-center justify-between mb-2">
                                              <p className="text-slate-600 font-medium">Gross Receipts</p>p>
                                              <FileBarChart className="text-green-600" size={24} />
                                  </div>div>
                                  <p className="text-4xl font-black text-green-600">{formatCurrency(reportData.grossReceipts)}</p>p>
                        </div>div>
                
                  {/* Cost of Goods Sold */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                              <p className="text-slate-600 font-medium">Cost of Goods Sold</p>p>
                                              <Calculator className="text-blue-600" size={24} />
                                  </div>div>
                                  <p className="text-4xl font-black text-blue-600">{formatCurrency(reportData.cogs)}</p>p>
                        </div>div>
                
                  {/* Platform Fees */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                                  <div className="flex items-center justify-between mb-2">
                                              <p className="text-slate-600 font-medium">Platform Fees</p>p>
                                              <AlertCircle className="text-orange-600" size={24} />
                                  </div>div>
                                  <p className="text-4xl font-black text-orange-600">{formatCurrency(reportData.platformFees)}</p>p>
                        </div>div>
                
                  {/* Shipping Costs */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                                  <div className="flex items-center justify-between mb-2">
                                              <p className="text-slate-600 font-medium">Shipping Costs</p>p>
                                              <Download className="text-purple-600" size={24} />
                                  </div>div>
                                  <p className="text-4xl font-black text-purple-600">{formatCurrency(reportData.shippingCosts)}</p>p>
                        </div>div>
                </div>div>
          
            {/* Expenses by Category */}
            {Object.keys(reportData.expensesByCategory).length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                              <h2 className="text-2xl font-black text-slate-900 mb-6">Expenses by Category</h2>h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(reportData.expensesByCategory).map(([category, amount]) => (
                                    <div key={category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                    <span className="font-semibold text-slate-900 capitalize">{category}</span>span>
                                                    <span className="text-slate-600">{formatCurrency(amount)}</span>span>
                                    </div>div>
                                  ))}
                              </div>div>
                    </div>div>
                )}
          
            {/* Summary */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white">
                        <h2 className="text-2xl font-black mb-6">Tax Summary</h2>h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                              <p className="text-slate-300 text-sm">Total Expenses</p>p>
                                              <p className="text-4xl font-black text-white mt-2">{formatCurrency(reportData.totalExpenses)}</p>p>
                                  </div>div>
                                  <div>
                                              <p className="text-slate-300 text-sm">Taxable Income</p>p>
                                              <p className="text-4xl font-black text-yellow-400 mt-2">{formatCurrency(reportData.grossReceipts - reportData.cogs)}</p>p>
                                  </div>div>
                                  <div>
                                              <p className="text-slate-300 text-sm">Net Profit</p>p>
                                              <p className="text-4xl font-black text-green-400 mt-2">{formatCurrency(reportData.netProfit)}</p>p>
                                  </div>div>
                        </div>div>
                        <p className="text-slate-400 text-sm mt-6">
                                  💡 Tip: Keep detailed records of all expenses and costs for accurate tax reporting.
                        </p>p>
                </div>div>
          </div>div>
        );
};

export default TaxReports;</div>
