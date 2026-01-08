
import React, { useState, useMemo } from 'react';
import { Invoice, FilterRange } from '../types';
import { isInRange } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ReportsViewProps {
  invoices: Invoice[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ invoices }) => {
  const [filter, setFilter] = useState<FilterRange>('اليوم');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const customRange = filter === 'مخصص' ? { start: customStart, end: customEnd } : undefined;
      return isInRange(inv.date, filter, customRange);
    });
  }, [invoices, filter, customStart, customEnd]);

  const stats = useMemo(() => {
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const cashSales = filteredInvoices.filter(i => i.paymentMethod === 'نقدي').reduce((sum, inv) => sum + inv.total, 0);
    const bankSales = filteredInvoices.filter(i => i.paymentMethod === 'بنكي').reduce((sum, inv) => sum + inv.total, 0);
    
    const itemMap = new Map<string, { qty: number, amount: number }>();
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const existing = itemMap.get(item.name) || { qty: 0, amount: 0 };
        itemMap.set(item.name, {
          qty: existing.qty + item.quantity,
          amount: existing.amount + (item.customPrice * item.quantity)
        });
      });
    });

    const items = Array.from(itemMap.entries()).map(([name, data]) => ({ name, ...data }));
    
    return { totalSales, cashSales, bankSales, items };
  }, [filteredInvoices]);

  const COLORS = ['#6f4e37', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Filters Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">تقارير المبيعات</h2>
          <p className="text-gray-500">متابعة الأداء المالي والكمي</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {(['اليوم', 'الأسبوع الحالي', 'الأسبوع الماضي', 'الشهر الحالي', 'الشهر الماضي', 'مخصص'] as FilterRange[]).map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === r 
                ? 'bg-[#6f4e37] text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {filter === 'مخصص' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">من:</span>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#6f4e37]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">إلى:</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#6f4e37]" />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#6f4e37]"></div>
          <div className="text-gray-500 text-sm font-semibold mb-2">إجمالي المبيعات</div>
          <div className="text-4xl font-black text-gray-800">{stats.totalSales} <small className="text-xl">₪</small></div>
          <div className="text-xs text-gray-400 mt-2">{filteredInvoices.length} فاتورة مسجلة</div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <div className="text-gray-500 text-sm font-semibold mb-2">الدفع النقدي</div>
          <div className="text-4xl font-black text-green-600">{stats.cashSales} <small className="text-xl">₪</small></div>
          <div className="text-xs text-gray-400 mt-2">{(stats.cashSales / (stats.totalSales || 1) * 100).toFixed(0)}% من الإجمالي</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <div className="text-gray-500 text-sm font-semibold mb-2">الدفع البنكي</div>
          <div className="text-4xl font-black text-blue-600">{stats.bankSales} <small className="text-xl">₪</small></div>
          <div className="text-xs text-gray-400 mt-2">{(stats.bankSales / (stats.totalSales || 1) * 100).toFixed(0)}% من الإجمالي</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Item Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">توزيع مبيعات الأصناف (كمية)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.items.sort((a, b) => b.qty - a.qty).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="qty" fill="#6f4e37" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Item Sales Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-700">تفاصيل الأصناف المباعة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4">الصنف</th>
                  <th className="px-6 py-4 text-center">الكمية</th>
                  <th className="px-6 py-4">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.items.sort((a, b) => b.amount - a.amount).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-700">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">{item.qty}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-[#6f4e37]">{item.amount} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.items.length === 0 && (
              <div className="p-20 text-center text-gray-400">لا توجد بيانات لهذا النطاق الزمني</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
