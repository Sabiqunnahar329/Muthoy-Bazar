import { createContext, useContext, useState } from 'react';

const dict = {
  en: {
    tagline: 'Affordable and comfortable shopping',
    search: 'Search groceries or brands',
    login: 'Login', logout: 'Logout', cart: 'Cart', shoppingCart: 'Shopping Cart', close: 'Close',
    emptyCart: 'Your cart is empty', alsoLike: 'You May Also Like', add: 'Add', total: 'Total', checkout: 'CHECKOUT',
    loginHint: 'Have an account? Log in for faster checkout (optional).',
    quickLinks: 'Quick Links', categories: 'Categories', contactInfo: 'Contact Info',
    home: 'Home', shop: 'Shop', contact: 'Contact', policies: 'Policies',
    about: 'Your neighbourhood grocery store, online. Everyday staples, spices, snacks and household essentials delivered to your door.',
    rights: 'All rights reserved.', developedBy: 'Developed by',
    chatTitle: 'Chat with us', chatSub: 'We usually reply within a few minutes.',
    messenger: 'Messenger', whatsapp: 'WhatsApp', helpline: 'Call helpline',
  },
  bn: {
    tagline: 'সাধ্যের মধ্যে স্বস্তির বাজার',
    search: 'মুদি পণ্য বা ব্র্যান্ড খুঁজুন',
    login: 'লগইন', logout: 'লগআউট', cart: 'কার্ট', shoppingCart: 'শপিং কার্ট', close: 'বন্ধ করুন',
    emptyCart: 'আপনার কার্ট খালি', alsoLike: 'আপনার পছন্দ হতে পারে', add: 'যোগ করুন', total: 'মোট', checkout: 'চেকআউট',
    loginHint: 'অ্যাকাউন্ট আছে? দ্রুত চেকআউটের জন্য লগইন করুন (ঐচ্ছিক)।',
    quickLinks: 'দ্রুত লিংক', categories: 'ক্যাটাগরি', contactInfo: 'যোগাযোগ',
    home: 'হোম', shop: 'শপ', contact: 'যোগাযোগ', policies: 'নীতিমালা',
    about: 'আপনার পাড়ার মুদি দোকান, এখন অনলাইনে। প্রতিদিনের চাল-ডাল, মসলা, স্ন্যাকস ও ঘরের প্রয়োজনীয় সব কিছু পৌঁছে যাবে আপনার দরজায়।',
    rights: 'সর্বস্বত্ব সংরক্ষিত।', developedBy: 'ডেভেলপ করেছেন',
    chatTitle: 'আমাদের সাথে কথা বলুন', chatSub: 'আমরা সাধারণত কয়েক মিনিটের মধ্যে উত্তর দিই।',
    messenger: 'মেসেঞ্জার', whatsapp: 'হোয়াটসঅ্যাপ', helpline: 'হেল্পলাইনে কল করুন',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mb_lang') || 'bn');
  const toggle = () => {
    const next = lang === 'bn' ? 'en' : 'bn';
    localStorage.setItem('mb_lang', next);
    setLang(next);
  };
  const t = (key) => dict[lang][key] ?? dict.en[key] ?? key;
  return <LanguageContext.Provider value={{ lang, toggle, t }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
