
import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem, PaymentMethod, Invoice, Category } from '../types';
import { format } from 'date-fns';

interface POSViewProps {
  menu: MenuItem[];
  onSaveInvoice: (invoice: Invoice) => Promise<void> | void;
  invoices: Invoice[];
  onDeleteInvoice: (id: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ menu, onSaveInvoice, invoices, onDeleteInvoice }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategory, setSelectedCategory] = useState<Category>('المشروبات الساخنة');

  const categories: Category[] = ['المشروبات الساخنة', 'المشروبات الباردة', 'سندوتشات الفينو', 'أخرى'];

  const dailyInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date === date);
  }, [invoices, date]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1, customPrice: item.price }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const updatePrice = (id: string, price: number) => {
    setCart(cart.map(c => c.id === id ? { ...c, customPrice: price } : c));
  };

  const total = cart.reduce((sum, item) => sum + (item.customPrice * item.quantity), 0);

  const handleSave = () => {
    if (cart.length === 0) return;

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: customerName || undefined,
      date,
      items: [...cart],
      paymentMethod,
      total
    };

    onSaveInvoice(newInvoice);
    setCart([]);
    setCustomerName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 h-full">
      {/* Menu Section */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-semibold ${selectedCategory === cat
                ? 'bg-[#6f4e37] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {menu.filter(item => item.category === selectedCategory).map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#6f4e37] hover:shadow-lg transition-all text-right active:scale-95"
            >
              <div className="text-gray-500 text-xs mb-1">{item.category}</div>
              <div className="font-bold text-gray-800 text-lg">{item.name}</div>
              <div className="text-[#6f4e37] font-semibold mt-2">{item.price} ₪</div>
            </button>
          ))}
        </div>

        {/* Recent Invoices List (Directly below for accessibility) */}
        <div className="mt-8 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-800 text-lg">سجل فواتير اليوم</h3>
              <span className="text-gray-400 text-sm">({date})</span>
            </div>
            <span className="bg-[#6f4e37] text-white text-xs px-3 py-1 rounded-full font-bold">{dailyInvoices.length} فواتير</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {dailyInvoices.length === 0 ? (
              <div className="p-12 text-center text-gray-400">لا يوجد فواتير مسجلة اليوم</div>
            ) : (
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-bold">العميل</th>
                    <th className="px-6 py-4 text-center font-bold">الدفع</th>
                    <th className="px-6 py-4 font-bold">الإجمالي</th>
                    <th className="px-6 py-4 text-center font-bold">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailyInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{inv.customerName || 'عميل نقدي'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${inv.paymentMethod === 'نقدي' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-[#6f4e37]">{inv.total} ₪</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Cart/Invoice Sidebar */}
      <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden sticky top-6 max-h-[calc(100vh-100px)]">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">الفاتورة الجديدة</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">اسم العميل</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="اختياري..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#6f4e37]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">تاريخ الفاتورة</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase text-center">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setPaymentMethod('نقدي')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'نقدي' ? 'bg-[#6f4e37] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                  >
                    نقدي (كاش)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('بنكي')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'بنكي' ? 'bg-[#6f4e37] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                  >
                    دفع بنكي
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
              <p>ابدأ باختيار الأصناف من المنيو</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800">{item.name}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">-</button>
                    <span className="font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={item.customPrice}
                      onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-gray-200 rounded text-center font-black text-[#6f4e37]"
                    />
                    <span className="text-xs font-black text-[#6f4e37]">₪</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-[#2c1810] text-white rounded-t-[3rem]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">الإجمالي</span>
            <span className="text-4xl font-black">{total} <small className="text-sm">₪</small></span>
          </div>
          <button
            onClick={handleSave}
            disabled={cart.length === 0}
            className={`w-full py-5 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${cart.length > 0
              ? 'bg-[#6f4e37] hover:bg-[#8b624a] text-white active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
              }`}
          >
            حفظ الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};
