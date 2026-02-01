import React, { useState, useEffect } from 'react';
import { InventoryItem, AppSettings } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { Plus, Trash2, Calendar, ShoppingBag, DollarSign, Tag, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { itemsService } from '../services/supabaseClient';

interface InventoryProps {
    inventory: InventoryItem[];
    onAddItem: (item: any) => void;
    onDeleteItem: (id: string) => void;
    onSellItem: (id: string, saleData: any) => void;
    settings: AppSettings;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onAddItem, onDeleteItem, onSellItem, settings }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showSellForm, setShowSellForm] = useState<string | null>(null);
    const [itemForm, setItemForm] = useState({
          itemName: '',
          description: '',
          purchasePrice: 0,
          sellingPrice: 0,
          quantity: 1,
          shippingPaid: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch inventory from Supabase on component mount
    useEffect(() => {
          const loadInventory = async () => {
                  try {
                            setLoading(true);
                            const items = await itemsService.getAllItems();
                            console.log('Loaded items from Supabase:', items);
                  } catch (err) {
                            setError('Failed to load inventory from Supabase');
                            console.error('Error loading inventory:', err);
                  } finally {
                            setLoading(false);
                  }
          };

                  loadInventory();
    }, []);

    const handleAddItem = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!itemForm.itemName.trim()) {
                  setError('Item name is required');
                  return;
          }

          try {
                  setLoading(true);
                  const newItem = {
                            name: itemForm.itemName,
                            cost: itemForm.purchasePrice + itemForm.shippingPaid,
                            price: itemForm.sellingPrice,
                            status: 'available',
                  };

            const result = await itemsService.addItem(newItem);
                  console.log('Item added to Supabase:', result);

            // Reset form
            setItemForm({
                      itemName: '',
                      description: '',
                      purchasePrice: 0,
                      sellingPrice: 0,
                      quantity: 1,
                      shippingPaid: 0,
            });
                  setShowAddForm(false);
                  onAddItem(newItem);
          } catch (err) {
                  setError('Failed to add item to inventory');
                  console.error('Error adding item:', err);
          } finally {
                  setLoading(false);
          }
    };

    const handleDeleteItem = async (id: string) => {
          if (confirm('Are you sure you want to delete this item?')) {
                  try {
                            setLoading(true);
                            await itemsService.deleteItem(id);
                            console.log('Item deleted from Supabase:', id);
                            onDeleteItem(id);
                  } catch (err) {
                            setError('Failed to delete item');
                            console.error('Error deleting item:', err);
                  } finally {
                            setLoading(false);
                  }
          }
    };

    const handleSellItem = async (id: string, saleData: any) => {
          try {
                  setLoading(true);
                  await itemsService.updateItem(id, { status: 'sold' });
                  console.log('Item marked as sold in Supabase:', id);
                  onSellItem(id, saleData);
                  setShowSellForm(null);
          } catch (err) {
                  setError('Failed to update item status');
                  console.error('Error selling item:', err);
          } finally {
                  setLoading(false);
          }
    };

    const activeItems = inventory.filter(i => i.status === 'available');

    return (
          <div className="space-y-8 pb-12">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Stock</h1>h1>
                                  <p className="text-slate-500 font-medium">Add items here first. Move them to Sales once sold.</p>p>
                        </div>div>
                        <button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[24px] font-black hover:bg-primary/90 transition-colors"
                                  >
                                  <Plus size={20} />
                                  Add Item
                        </button>button>
                </header>header>
          
            {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                              <button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900">✕</button>button>
                    </div>div>
                )}
          
            {showAddForm && (
                    <form onSubmit={handleAddItem} className="bg-slate-50 p-6 rounded-2xl space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <input
                                                          type="text"
                                                          placeholder="Item Name"
                                                          value={itemForm.itemName}
                                                          onChange={(e) => setItemForm({...itemForm, itemName: e.target.value})}
                                                          className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                          disabled={loading}
                                                        />
                                          <input
                                                          type="number"
                                                          placeholder="Purchase Price"
                                                          value={itemForm.purchasePrice}
                                                          onChange={(e) => setItemForm({...itemForm, purchasePrice: parseFloat(e.target.value) || 0})}
                                                          className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                          disabled={loading}
                                                        />
                                          <input
                                                          type="number"
                                                          placeholder="Selling Price"
                                                          value={itemForm.sellingPrice}
                                                          onChange={(e) => setItemForm({...itemForm, sellingPrice: parseFloat(e.target.value) || 0})}
                                                          className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                          disabled={loading}
                                                        />
                                          <input
                                                          type="number"
                                                          placeholder="Shipping Paid"
                                                          value={itemForm.shippingPaid}
                                                          onChange={(e) => setItemForm({...itemForm, shippingPaid: parseFloat(e.target.value) || 0})}
                                                          className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                          disabled={loading}
                                                        />
                              </div>div>
                              <div className="flex gap-2">
                                          <button
                                                          type="submit"
                                                          disabled={loading}
                                                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                                                        >
                                            {loading ? 'Adding...' : 'Add to Inventory'}
                                          </button>button>
                                          <button
                                                          type="button"
                                                          onClick={() => setShowAddForm(false)}
                                                          className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400"
                                                        >
                                                        Cancel
                                          </button>button>
                              </div>div>
                    </form>form>
                )}
          
            {loading && <p className="text-center text-slate-600">Loading inventory...</p>p>}
          
                <div className="grid gap-4">
                  {activeItems.map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1">
                                                                <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>h3>
                                                                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                                                  <div>
                                                                                                      <p className="text-slate-500">Cost</p>p>
                                                                                                      <p className="font-semibold">{formatCurrency(item.cost || 0)}</p>p>
                                                                                    </div>div>
                                                                                  <div>
                                                                                                      <p className="text-slate-500">Selling Price</p>p>
                                                                                                      <p className="font-semibold text-green-600">{formatCurrency(item.price || 0)}</p>p>
                                                                                    </div>div>
                                                                                  <div>
                                                                                                      <p className="text-slate-500">Profit</p>p>
                                                                                                      <p className="font-semibold text-blue-600">{formatCurrency((item.price || 0) - (item.cost || 0))}</p>p>
                                                                                    </div>div>
                                                                </div>div>
                                                </div>div>
                                                <div className="flex gap-2">
                                                                <button
                                                                                    onClick={() => setShowSellForm(item.id)}
                                                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold transition-colors"
                                                                                  >
                                                                                  Sell
                                                                </button>button>
                                                                <button
                                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                                    disabled={loading}
                                                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors disabled:opacity-50"
                                                                                  >
                                                                                  <Trash2 size={18} />
                                                                </button>button>
                                                </div>div>
                                  </div>div>
                      
                        {showSellForm === item.id && (
                                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                                      <button
                                                                          onClick={() => handleSellItem(item.id, { salePrice: item.price })}
                                                                          disabled={loading}
                                                                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                                                                        >
                                                        {loading ? 'Processing...' : 'Confirm Sale'}
                                                      </button>button>
                                      </div>div>
                                  )}
                      </div>div>
                    ))}
                </div>div>
          
            {activeItems.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                              <Package size={48} className="mx-auto text-slate-300 mb-4" />
                              <p className="text-slate-600 font-medium">No items in inventory. Add items here first.</p>p>
                    </div>div>
                )}
          </div>div>
        );
};

export default Inventory;</div>
