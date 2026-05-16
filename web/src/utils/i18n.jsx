import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'mg-locale';

const dict = {
  en: {
    'app.name': 'Mix Garage',
    'nav.browse': 'Browse',
    'nav.sell': 'Sell a car',
    'nav.favourites': 'Favourites',
    'nav.messages': 'Messages',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.signin': 'Sign in',
    'nav.signout': 'Sign out',
    'nav.profile': 'Profile',
    'home.hero.title': 'Find your next ride.',
    'home.hero.subtitle': 'Thousands of trusted cars from sellers near you.',
    'home.hero.cta': 'Browse cars',
    'home.hero.sell': 'Sell yours',
    'home.featured': 'Featured listings',
    'home.recent': 'Recently added',
    'browse.title': 'Browse cars',
    'browse.search': 'Search make, model, keyword...',
    'browse.filters': 'Filters',
    'browse.sort.newest': 'Newest',
    'browse.sort.price_asc': 'Price: Low to High',
    'browse.sort.price_desc': 'Price: High to Low',
    'browse.empty.title': 'No cars match your filters',
    'browse.empty.sub': 'Try widening your search or clearing filters.',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
  },
  ar: {
    'app.name': 'مكس جراج',
    'nav.browse': 'تصفح',
    'nav.sell': 'بيع سيارة',
    'nav.favourites': 'المفضلة',
    'nav.messages': 'الرسائل',
    'nav.dashboard': 'لوحة التحكم',
    'nav.admin': 'الإدارة',
    'nav.signin': 'تسجيل الدخول',
    'nav.signout': 'تسجيل الخروج',
    'nav.profile': 'الملف الشخصي',
    'home.hero.title': 'اعثر على سيارتك القادمة.',
    'home.hero.subtitle': 'آلاف السيارات الموثوقة من بائعين بقربك.',
    'home.hero.cta': 'تصفح السيارات',
    'home.hero.sell': 'بِع سيارتك',
    'home.featured': 'إعلانات مميزة',
    'home.recent': 'أحدث الإعلانات',
    'browse.title': 'تصفح السيارات',
    'browse.search': 'ابحث عن ماركة، موديل، كلمة...',
    'browse.filters': 'الفلاتر',
    'browse.sort.newest': 'الأحدث',
    'browse.sort.price_asc': 'السعر: من الأقل للأعلى',
    'browse.sort.price_desc': 'السعر: من الأعلى للأقل',
    'browse.empty.title': 'لا توجد سيارات مطابقة',
    'browse.empty.sub': 'جرّب توسيع البحث أو مسح الفلاتر.',
    'common.loading': 'جارٍ التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.back': 'رجوع',
    'common.clear': 'مسح',
    'common.apply': 'تطبيق',
  },
};

const I18nCtx = createContext({ locale: 'en', t: (k) => k, setLocale: () => {} });

export function initLocale() {
  const saved = localStorage.getItem(KEY) || 'en';
  document.documentElement.lang = saved;
  document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(localStorage.getItem(KEY) || 'en');
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(KEY, locale);
  }, [locale]);
  const t = (k) => dict[locale]?.[k] ?? dict.en[k] ?? k;
  return <I18nCtx.Provider value={{ locale, setLocale: setLocaleState, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() { return useContext(I18nCtx); }
