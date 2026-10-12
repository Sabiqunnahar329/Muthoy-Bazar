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
    allCategories: 'All',
    homeFeatures: 'Home Features', featuredProducts: 'Featured Products', specialOffers: 'Special Offers',
    bestSellers: 'Best Sellers', newArrivals: 'New Arrivals', offerZone: 'Offer Zone',
    slide1Text: 'Rice, oil, spices and daily needs from trusted brands. Cash on delivery across Bangladesh.',
    slide1Cta: 'Shop the offer zone', slide2Title: 'New arrivals every week',
    slide2Text: 'See what just landed on our shelves.', slide2Cta: 'Shop new arrivals',
    slide3Title: 'Pure honey and premium dates', slide3Text: 'Natural sweetness from trusted sources, packed fresh.',
    slide3Cta: 'Shop honey', featuredCategories: 'Featured categories',
    promoTitle: 'Save more on your monthly bazar',
    promoText: 'Discounted rice, oil, ghee, honey and more.', shopOffers: 'Shop offers',
    items: 'Items', loadingProducts: 'Loading products…', loadProductsError: 'We could not load the products.',
    serverStarting: 'The server may be starting up after a quiet period, which can take up to a minute. Please try again.',
    tryAgain: 'Try again', noProducts: 'No products are available yet.',
    viewAllItems: 'View all items', topSelling: 'Top selling products', ourBrands: 'Our brands',
    justForYou: 'Just for you', loadMore: 'Load more', customersSay: 'What our customers say',
    review1: 'Rice and oil arrived in two days, sealed and fresh. I will order again next month.',
    review2: 'Cash on delivery makes it easy. The ghee quality is better than the local shop.',
    review3: 'Good prices on monthly bazar items. Support answered my questions the same day.',
    serviceHolder: 'Service holder, Dhaka', teacher: 'Teacher, Chattogram', businessOwner: 'Business owner, Sylhet',
    promotions: 'Promotions', previousSlide: 'Previous slide', nextSlide: 'Next slide',
    scrollCategoriesLeft: 'Scroll categories left', scrollCategoriesRight: 'Scroll categories right',
    openMap: 'Open this location in Google Maps', trackOrder: 'Track order', termsPolicy: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy', shippingPolicy: 'Shipping & Delivery', returnsPolicy: 'Return & Refund',
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
    allCategories: 'সব',
    homeFeatures: 'হোম ফিচার', featuredProducts: 'বিশেষ পণ্য', specialOffers: 'বিশেষ অফার',
    bestSellers: 'সর্বাধিক বিক্রিত', newArrivals: 'নতুন পণ্য', offerZone: 'অফার জোন',
    slide1Text: 'বিশ্বস্ত ব্র্যান্ডের চাল, তেল, মসলা ও নিত্যপ্রয়োজনীয় পণ্য। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।',
    slide1Cta: 'অফার দেখুন', slide2Title: 'প্রতি সপ্তাহে নতুন পণ্য',
    slide2Text: 'আমাদের দোকানে নতুন কী এসেছে, দেখে নিন।', slide2Cta: 'নতুন পণ্য দেখুন',
    slide3Title: 'খাঁটি মধু ও উন্নতমানের খেজুর', slide3Text: 'বিশ্বস্ত উৎসের প্রাকৃতিক মিষ্টি, যত্নে প্যাক করা।',
    slide3Cta: 'মধু দেখুন', featuredCategories: 'জনপ্রিয় ক্যাটাগরি',
    promoTitle: 'মাসের বাজারে সাশ্রয় করুন',
    promoText: 'ছাড়ে চাল, তেল, ঘি, মধু এবং আরও অনেক কিছু।', shopOffers: 'অফার দেখুন',
    items: 'টি পণ্য', loadingProducts: 'পণ্য লোড হচ্ছে…', loadProductsError: 'পণ্য লোড করা যায়নি।',
    serverStarting: 'সার্ভার চালু হতে এক মিনিট পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    tryAgain: 'আবার চেষ্টা করুন', noProducts: 'এখনো কোনো পণ্য পাওয়া যায়নি।',
    viewAllItems: 'সব পণ্য দেখুন', topSelling: 'সর্বাধিক বিক্রিত পণ্য', ourBrands: 'আমাদের ব্র্যান্ড',
    justForYou: 'আপনার জন্য', loadMore: 'আরও পণ্য দেখুন', customersSay: 'আমাদের ক্রেতারা যা বলেন',
    review1: 'চাল ও তেল দুই দিনের মধ্যে পেয়েছি, প্যাকেট সিল করা ও পণ্য টাটকা ছিল। আগামী মাসে আবার অর্ডার করব।',
    review2: 'ক্যাশ অন ডেলিভারিতে কেনাকাটা সহজ হয়েছে। ঘির মান স্থানীয় দোকানের চেয়ে ভালো।',
    review3: 'মাসের বাজারের পণ্যের দাম ভালো। সাপোর্ট একই দিনে আমার প্রশ্নের উত্তর দিয়েছে।',
    serviceHolder: 'চাকরিজীবী, ঢাকা', teacher: 'শিক্ষক, চট্টগ্রাম', businessOwner: 'ব্যবসায়ী, সিলেট',
    promotions: 'বিশেষ অফার', previousSlide: 'আগের স্লাইড', nextSlide: 'পরের স্লাইড',
    scrollCategoriesLeft: 'ক্যাটাগরি বামে সরান', scrollCategoriesRight: 'ক্যাটাগরি ডানে সরান',
    openMap: 'গুগল ম্যাপে এই ঠিকানা দেখুন', trackOrder: 'অর্ডার ট্র্যাক করুন', termsPolicy: 'শর্তাবলি',
    privacyPolicy: 'গোপনীয়তা নীতি', shippingPolicy: 'শিপিং ও ডেলিভারি', returnsPolicy: 'ফেরত ও রিফান্ড',
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
