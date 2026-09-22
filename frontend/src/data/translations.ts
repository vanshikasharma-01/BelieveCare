interface Translation {
  // Navbar / general
  all: string;
  home: string;
  medicines: string;
  wellness: string;
  medicalTools: string;
  cosmetics: string;
  firstAidCategory: string;
  brands: string;
  search: string;
  seniorModeLabel: string;
  firstAid: string;
  startKit: string;
  addCart: string;
  cart: string;
  wishlist: string;
  profile: string;

  // Home page
  allProducts: string;

  // Medicines / filters sidebar
  filters: string;
  clearAll: string;
  category: string;
  subcategory: string;
  allCategories: string;
  allSubcategories: string;
  priceRange: string;
  loading: string;
  productsFound: string;
  noMedicinesFound: string;
  allMedicines: string;
  filterSearchLabel: string;
  filterSearchPlaceholder: string;

  // Product card / product details
  brand: string;
  price: string;
  stock: string;
  inStock: string;
  outOfStock: string;
  addToWishlist: string;
  inWishlist: string;
  suggestSubstitute: string;
  hideSubstitutes: string;
  additionalInfo: string;
  manufacturer: string;
  strength: string;
  saltComposition: string;
  descriptionLabel: string;
  usesLabel: string;
  dosageLabel: string;
  sideEffectsLabel: string;
  warningsLabel: string;
  prescriptionLabel: string;
  prescriptionRequiredValue: string;
  deliveryCharge: string;
  freeLabel: string;
  includingTax: string;
  freeDeliveryNote: string;

  // Cart
  yourCart: string;
  cartEmpty: string;
  browseMedicines: string;
  browseMore: string;
  subtotal: string;
  remove: string;
  total: string;
  proceedToCheckout: string;

  // Wishlist
  myWishlist: string;
  wishlistSubtitle: string;
  noProductsSaved: string;
  continueShopping: string;

  // Checkout
  checkout: string;
  orderSummary: string;
  qty: string;
  deliveryAddress: string;
  loadingAddresses: string;
  noSavedAddresses: string;
  addDeliveryAddress: string;
  addAnotherAddress: string;
  paymentMethod: string;
  cashOnDelivery: string;
  onlinePayment: string;
  placingOrder: string;
  placeOrder: string;

  // Order history
  orderHistory: string;
  loadingOrders: string;
  noOrdersYet: string;

  // Profile
  myProfile: string;
  loadingProfile: string;
  email: string;
  phone: string;
  editProfile: string;
  save: string;
  saving: string;
  myOrders: string;
  savedAddresses: string;
  settings: string;
  logout: string;

  // Footer
  footerTagline: string;
  footerCompany: string;
  footerAboutUs: string;
  footerFaq: string;
  footerTerms: string;
  footerGetInTouch: string;
  footerContactUs: string;
  footerVisitStore: string;
  footerRights: string;
}

interface Translations {
  en: Translation;
  hi: Translation;
}

const translations: Translations = {

  en: {
    all: "All",
    home: "Home",
    medicines: "Medicines",
    wellness: "Wellness",
    medicalTools: "Medical Tools",
    cosmetics: "Cosmetics",
    firstAidCategory: "First Aid",
    brands: "Brands",
    search: "Search medicines, wellness products...",
    seniorModeLabel: "Senior Mode",
    firstAid: "Customize Your First Aid Kit",
    startKit: "Start Building Your Kit",
    addCart: "Add to Cart",
    cart: "Cart",
    wishlist: "Wishlist",
    profile: "Profile",

    allProducts: "All Products",

    filters: "Filters",
    clearAll: "Clear All",
    category: "Category",
    subcategory: "Subcategory",
    allCategories: "All Categories",
    allSubcategories: "All Subcategories",
    priceRange: "Price Range (₹)",
    loading: "Loading medicines...",
    productsFound: "product(s) found",
    noMedicinesFound: "No Medicines Found",
    allMedicines: "All Medicines",
    filterSearchLabel: "Search",
    filterSearchPlaceholder: "Search medicines...",

    brand: "Brand",
    price: "Price",
    stock: "Stock",
    inStock: "available",
    outOfStock: "Out of stock",
    addToWishlist: "Add to Wishlist",
    inWishlist: "In Wishlist",
    suggestSubstitute: "Suggest Substitute",
    hideSubstitutes: "Hide Substitutes",
    additionalInfo: "Additional Information",
    manufacturer: "Manufacturer",
    strength: "Strength",
    saltComposition: "Salt Composition",
    descriptionLabel: "Description",
    usesLabel: "Uses",
    dosageLabel: "Dosage",
    sideEffectsLabel: "Side Effects",
    warningsLabel: "Warnings",
    prescriptionLabel: "Prescription",
    prescriptionRequiredValue: "Required",
    deliveryCharge: "Delivery Charge",
    freeLabel: "FREE",
    includingTax: "(including tax)",
    freeDeliveryNote: "Add ₹{amount} more to get FREE delivery",

    yourCart: "Your Cart",
    cartEmpty: "Your cart is empty",
    browseMedicines: "Browse Medicines",
    browseMore: "Browse More",
    subtotal: "Subtotal",
    remove: "Remove",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",

    myWishlist: "My Wishlist ❤️",
    wishlistSubtitle: "Your saved products",
    noProductsSaved: "No products saved",
    continueShopping: "Continue Shopping",

    checkout: "Checkout",
    orderSummary: "Order Summary",
    qty: "Qty",
    deliveryAddress: "Delivery Address",
    loadingAddresses: "Loading addresses...",
    noSavedAddresses: "You don't have any saved addresses yet.",
    addDeliveryAddress: "+ Add a delivery address",
    addAnotherAddress: "+ Add another address",
    paymentMethod: "Payment Method",
    cashOnDelivery: "Cash on Delivery",
    onlinePayment: "Online Payment",
    placingOrder: "Placing Order...",
    placeOrder: "Place Order",

    orderHistory: "Order History",
    loadingOrders: "Loading your orders...",
    noOrdersYet: "You haven't placed any orders yet.",

    myProfile: "My Profile",
    loadingProfile: "Loading profile...",
    email: "Email",
    phone: "Phone",
    editProfile: "Edit Profile",
    save: "Save",
    saving: "Saving...",
    myOrders: "My Orders",
    savedAddresses: "Saved Addresses",
    settings: "Settings",
    logout: "Logout",

    footerTagline: "We Believe In Care",
    footerCompany: "Company",
    footerAboutUs: "About Us",
    footerFaq: "FAQ",
    footerTerms: "Terms & Conditions",
    footerGetInTouch: "Get In Touch",
    footerContactUs: "Contact Us",
    footerVisitStore: "Visit Our Store",
    footerRights: "All rights reserved.",
  },

  hi: {
    all: "सभी",
    home: "होम",
    medicines: "दवाइयाँ",
    wellness: "वेलनेस",
    medicalTools: "चिकित्सा उपकरण",
    cosmetics: "कॉस्मेटिक्स",
    firstAidCategory: "प्राथमिक चिकित्सा",
    brands: "ब्रांड",
    search: "दवाइयाँ खोजें...",
    seniorModeLabel: "वरिष्ठ मोड",
    firstAid: "अपनी प्राथमिक चिकित्सा किट बनाएँ",
    startKit: "किट बनाना शुरू करें",
    addCart: "कार्ट में जोड़ें",
    cart: "कार्ट",
    wishlist: "विशलिस्ट",
    profile: "प्रोफ़ाइल",

    allProducts: "सभी उत्पाद",

    filters: "फ़िल्टर",
    clearAll: "सभी हटाएं",
    category: "श्रेणी",
    subcategory: "उप-श्रेणी",
    allCategories: "सभी श्रेणियाँ",
    allSubcategories: "सभी उप-श्रेणियाँ",
    priceRange: "मूल्य सीमा (₹)",
    loading: "दवाइयाँ लोड हो रही हैं...",
    productsFound: "उत्पाद मिले",
    noMedicinesFound: "कोई दवा नहीं मिली",
    allMedicines: "सभी दवाइयाँ",
    filterSearchLabel: "खोजें",
    filterSearchPlaceholder: "दवाइयाँ खोजें...",

    brand: "ब्रांड",
    price: "मूल्य",
    stock: "स्टॉक",
    inStock: "उपलब्ध",
    outOfStock: "स्टॉक में नहीं",
    addToWishlist: "विशलिस्ट में जोड़ें",
    inWishlist: "विशलिस्ट में शामिल",
    suggestSubstitute: "विकल्प सुझाएं",
    hideSubstitutes: "विकल्प छिपाएं",
    additionalInfo: "अतिरिक्त जानकारी",
    manufacturer: "निर्माता",
    strength: "क्षमता",
    saltComposition: "साल्ट संरचना",
    descriptionLabel: "विवरण",
    usesLabel: "उपयोग",
    dosageLabel: "खुराक",
    sideEffectsLabel: "दुष्प्रभाव",
    warningsLabel: "चेतावनी",
    prescriptionLabel: "प्रिस्क्रिप्शन",
    prescriptionRequiredValue: "आवश्यक",
    deliveryCharge: "डिलीवरी शुल्क",
    freeLabel: "मुफ़्त",
    includingTax: "(कर सहित)",
    freeDeliveryNote: "मुफ़्त डिलीवरी पाने के लिए ₹{amount} और जोड़ें",

    yourCart: "आपकी कार्ट",
    cartEmpty: "आपकी कार्ट खाली है",
    browseMedicines: "दवाइयाँ देखें",
    browseMore: "और देखें",
    subtotal: "उप-योग",
    remove: "हटाएं",
    total: "कुल",
    proceedToCheckout: "चेकआउट करें",

    myWishlist: "मेरी विशलिस्ट ❤️",
    wishlistSubtitle: "आपके सहेजे गए उत्पाद",
    noProductsSaved: "कोई उत्पाद सहेजा नहीं गया",
    continueShopping: "खरीदारी जारी रखें",

    checkout: "चेकआउट",
    orderSummary: "ऑर्डर सारांश",
    qty: "मात्रा",
    deliveryAddress: "डिलीवरी पता",
    loadingAddresses: "पते लोड हो रहे हैं...",
    noSavedAddresses: "आपके पास अभी तक कोई सहेजा गया पता नहीं है।",
    addDeliveryAddress: "+ डिलीवरी पता जोड़ें",
    addAnotherAddress: "+ एक और पता जोड़ें",
    paymentMethod: "भुगतान का तरीका",
    cashOnDelivery: "डिलीवरी पर नकद",
    onlinePayment: "ऑनलाइन भुगतान",
    placingOrder: "ऑर्डर दिया जा रहा है...",
    placeOrder: "ऑर्डर करें",

    orderHistory: "ऑर्डर इतिहास",
    loadingOrders: "आपके ऑर्डर लोड हो रहे हैं...",
    noOrdersYet: "आपने अभी तक कोई ऑर्डर नहीं दिया है।",

    myProfile: "मेरी प्रोफ़ाइल",
    loadingProfile: "प्रोफ़ाइल लोड हो रही है...",
    email: "ईमेल",
    phone: "फ़ोन",
    editProfile: "प्रोफ़ाइल संपादित करें",
    save: "सहेजें",
    saving: "सहेजा जा रहा है...",
    myOrders: "मेरे ऑर्डर",
    savedAddresses: "सहेजे गए पते",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",

    footerTagline: "हम देखभाल में विश्वास रखते हैं",
    footerCompany: "कंपनी",
    footerAboutUs: "हमारे बारे में",
    footerFaq: "सामान्य प्रश्न",
    footerTerms: "नियम और शर्तें",
    footerGetInTouch: "संपर्क करें",
    footerContactUs: "संपर्क करें",
    footerVisitStore: "हमारा स्टोर देखें",
    footerRights: "सर्वाधिकार सुरक्षित।",
  },

};

export default translations;
