
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { POSView } from './components/POSView';
import { ReportsView } from './components/ReportsView';
import { MenuView } from './components/MenuView';
import { MenuItem, Invoice } from './types';
import { INITIAL_MENU } from './constants';
import { fetchMenu, saveMenu, fetchInvoices, saveInvoices } from './utils/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'pos' | 'reports' | 'menu'>('pos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [menuData, invoicesData] = await Promise.all([
          fetchMenu(),
          fetchInvoices()
        ]);

        // If menu is empty, use initial menu
        setMenu(menuData.length > 0 ? menuData : INITIAL_MENU);
        setInvoices(invoicesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('فشل الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.');
        // Fallback to initial data if API fails
        setMenu(INITIAL_MENU);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save menu to API when it changes
  useEffect(() => {
    if (!isLoading && menu.length > 0) {
      saveMenu(menu).catch(err => {
        console.error('Failed to save menu:', err);
      });
    }
  }, [menu, isLoading]);

  // Save invoices to API when they change
  useEffect(() => {
    if (!isLoading) {
      saveInvoices(invoices).catch(err => {
        console.error('Failed to save invoices:', err);
      });
    }
  }, [invoices, isLoading]);

  const handleAddInvoice = (inv: Invoice) => {
    setInvoices([inv, ...invoices]);
  };

  const handleDeleteInvoice = (id: string) => {
    // تم إزالة confirm لضمان عمل الحذف فوراً في كل البيئات
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const handleAddMenuItem = (item: MenuItem) => {
    setMenu([...menu, item]);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenu(prev => prev.filter(m => m.id !== id));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6f4e37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">خطأ في الاتصال</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#6f4e37] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#8b624a] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#6f4e37] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">كوفي كورنر</h1>
              <span className="text-xs text-green-500 font-semibold uppercase tracking-wider">نظام نشط</span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'pos' ? 'bg-[#6f4e37] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>نقطة البيع</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'reports' ? 'bg-[#6f4e37] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>التقارير</span>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'menu' ? 'bg-[#6f4e37] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>المنيو</span>
            </button>
          </nav>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors px-3 py-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm">خروج</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full pb-10">
        {activeTab === 'pos' && (
          <POSView
            menu={menu}
            invoices={invoices}
            onSaveInvoice={handleAddInvoice}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsView invoices={invoices} />
        )}
        {activeTab === 'menu' && (
          <MenuView
            menu={menu}
            onAdd={handleAddMenuItem}
            onDelete={handleDeleteMenuItem}
          />
        )}
      </main>
    </div>
  );
};

export default App;
