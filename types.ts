
export type Category = 'المشروبات الساخنة' | 'المشروبات الباردة' | 'سندوتشات الفينو' | 'أخرى';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
}

export interface CartItem extends MenuItem {
  menuItem?: string; // Reference to MenuItem ID for the backend
  quantity: number;
  customPrice: number;
}

export type PaymentMethod = 'نقدي' | 'بنكي';

export interface Invoice {
  id: string;
  customerName?: string;
  date: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  total: number;
}

export type FilterRange = 'اليوم' | 'الأسبوع الحالي' | 'الأسبوع الماضي' | 'الشهر الحالي' | 'الشهر الماضي' | 'مخصص';
