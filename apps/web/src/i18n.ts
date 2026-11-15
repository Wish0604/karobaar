export type SupportedLanguage =
  | "en"
  | "hi"
  | "bn"
  | "ta"
  | "te"
  | "mr"
  | "kn"
  | "ml"
  | "gu";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  locale: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", locale: "en-IN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", locale: "hi-IN" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", locale: "bn-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", locale: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", locale: "te-IN" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", locale: "mr-IN" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", locale: "kn-IN" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", locale: "ml-IN" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", locale: "gu-IN" },
];

export type TranslationKey =
  | "dashboard"
  | "products"
  | "orders"
  | "inventory"
  | "payments"
  | "customers"
  | "shop"
  | "settings"
  | "home"
  | "discover"
  | "assistant"
  | "profile"
  | "cart"
  | "logout"
  | "notifications"
  | "today"
  | "viewAllOrders"
  | "addProduct"
  | "recentAlerts"
  | "markRead"
  | "accountSettings"
  | "switchCustomer"
  | "myOrders"
  | "languageAndVoice"
  | "tapToSpeak"
  | "listening"
  | "askAssistant"
  | "selectLanguage"
  | "continue";

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    dashboard: "Dashboard", products: "Products", orders: "Orders", inventory: "Inventory", payments: "Payments", customers: "Customers", shop: "My Shop", settings: "Settings", home: "Home", discover: "Discover", assistant: "Assistant", profile: "Profile", cart: "Cart", logout: "Logout", notifications: "Notifications", today: "Today", viewAllOrders: "View All Orders", addProduct: "Add Product", recentAlerts: "Recent Alerts", markRead: "Mark read", accountSettings: "Account Settings", switchCustomer: "Switch to Customer Mode", myOrders: "My Orders", languageAndVoice: "Language & Voice", tapToSpeak: "Tap microphone to speak", listening: "Listening...", askAssistant: "Ask your assistant", selectLanguage: "Choose your language", continue: "Continue",
  },
  hi: {
    dashboard: "डैशबोर्ड", products: "उत्पाद", orders: "ऑर्डर", inventory: "इन्वेंटरी", payments: "भुगतान", customers: "ग्राहक", shop: "मेरी दुकान", settings: "सेटिंग्स", home: "होम", discover: "खोजें", assistant: "सहायक", profile: "प्रोफ़ाइल", cart: "कार्ट", logout: "लॉग आउट", notifications: "सूचनाएं", today: "आज", viewAllOrders: "सभी ऑर्डर देखें", addProduct: "उत्पाद जोड़ें", recentAlerts: "हाल की सूचनाएं", markRead: "पढ़ा हुआ करें", accountSettings: "खाता सेटिंग्स", switchCustomer: "ग्राहक मोड", myOrders: "मेरे ऑर्डर", languageAndVoice: "भाषा और आवाज़", tapToSpeak: "बोलने के लिए माइक्रोफ़ोन दबाएं", listening: "सुन रहा है...", askAssistant: "अपने सहायक से पूछें", selectLanguage: "अपनी भाषा चुनें", continue: "जारी रखें",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", products: "পণ্য", orders: "অর্ডার", inventory: "ইনভেন্টরি", payments: "পেমেন্ট", customers: "ক্রেতা", shop: "আমার দোকান", settings: "সেটিংস", home: "হোম", discover: "খুঁজুন", assistant: "সহায়ক", profile: "প্রোফাইল", cart: "কার্ট", logout: "লগ আউট", notifications: "বিজ্ঞপ্তি", today: "আজ", viewAllOrders: "সব অর্ডার দেখুন", addProduct: "পণ্য যোগ করুন", recentAlerts: "সাম্প্রতিক সতর্কতা", markRead: "পঠিত করুন", accountSettings: "অ্যাকাউন্ট সেটিংস", switchCustomer: "ক্রেতা মোড", myOrders: "আমার অর্ডার", languageAndVoice: "ভাষা ও ভয়েস", tapToSpeak: "কথা বলতে মাইক্রোফোন চাপুন", listening: "শুনছি...", askAssistant: "সহায়ককে জিজ্ঞাসা করুন", selectLanguage: "আপনার ভাষা বেছে নিন", continue: "চালিয়ে যান",
  },
  ta: {
    dashboard: "டாஷ்போர்டு", products: "பொருட்கள்", orders: "ஆர்டர்கள்", inventory: "சரக்கு", payments: "பணம்", customers: "வாடிக்கையாளர்கள்", shop: "என் கடை", settings: "அமைப்புகள்", home: "முகப்பு", discover: "தேடுக", assistant: "உதவியாளர்", profile: "சுயவிவரம்", cart: "கூடை", logout: "வெளியேறு", notifications: "அறிவிப்புகள்", today: "இன்று", viewAllOrders: "அனைத்து ஆர்டர்களையும் காண்க", addProduct: "பொருள் சேர்", recentAlerts: "சமீபத்திய எச்சரிக்கைகள்", markRead: "படித்ததாக குறி", accountSettings: "கணக்கு அமைப்புகள்", switchCustomer: "வாடிக்கையாளர் முறை", myOrders: "என் ஆர்டர்கள்", languageAndVoice: "மொழி மற்றும் குரல்", tapToSpeak: "பேச மைக்ரோஃபோனைத் தொடவும்", listening: "கேட்கிறது...", askAssistant: "உதவியாளரிடம் கேளுங்கள்", selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்", continue: "தொடரவும்",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్", products: "ఉత్పత్తులు", orders: "ఆర్డర్లు", inventory: "ఇన్వెంటరీ", payments: "చెల్లింపులు", customers: "కస్టమర్లు", shop: "నా దుకాణం", settings: "సెట్టింగ్స్", home: "హోమ్", discover: "వెతకండి", assistant: "సహాయకుడు", profile: "ప్రొఫైల్", cart: "కార్ట్", logout: "లాగ్ అవుట్", notifications: "నోటిఫికేషన్లు", today: "ఈరోజు", viewAllOrders: "అన్ని ఆర్డర్లు చూడండి", addProduct: "ఉత్పత్తి జోడించండి", recentAlerts: "ఇటీవలి హెచ్చరికలు", markRead: "చదివినట్లు గుర్తించండి", accountSettings: "ఖాతా సెట్టింగ్స్", switchCustomer: "కస్టమర్ మోడ్", myOrders: "నా ఆర్డర్లు", languageAndVoice: "భాష మరియు వాయిస్", tapToSpeak: "మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి", listening: "వింటోంది...", askAssistant: "సహాయకుడిని అడగండి", selectLanguage: "మీ భాషను ఎంచుకోండి", continue: "కొనసాగించండి",
  },
  mr: {
    dashboard: "डॅशबोर्ड", products: "उत्पादने", orders: "ऑर्डर", inventory: "साठा", payments: "पेमेंट", customers: "ग्राहक", shop: "माझे दुकान", settings: "सेटिंग्ज", home: "होम", discover: "शोधा", assistant: "सहाय्यक", profile: "प्रोफाइल", cart: "कार्ट", logout: "लॉग आउट", notifications: "सूचना", today: "आज", viewAllOrders: "सर्व ऑर्डर पहा", addProduct: "उत्पादन जोडा", recentAlerts: "अलीकडील सूचना", markRead: "वाचले असे चिन्हांकित करा", accountSettings: "खाते सेटिंग्ज", switchCustomer: "ग्राहक मोड", myOrders: "माझ्या ऑर्डर", languageAndVoice: "भाषा आणि आवाज", tapToSpeak: "बोलण्यासाठी मायक्रोफोन दाबा", listening: "ऐकत आहे...", askAssistant: "सहाय्यकाला विचारा", selectLanguage: "तुमची भाषा निवडा", continue: "पुढे चला",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", products: "ಉತ್ಪನ್ನಗಳು", orders: "ಆರ್ಡರ್‌ಗಳು", inventory: "ದಾಸ್ತಾನು", payments: "ಪಾವತಿಗಳು", customers: "ಗ್ರಾಹಕರು", shop: "ನನ್ನ ಅಂಗಡಿ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", home: "ಮುಖಪುಟ", discover: "ಹುಡುಕಿ", assistant: "ಸಹಾಯಕ", profile: "ಪ್ರೊಫೈಲ್", cart: "ಕಾರ್ಟ್", logout: "ಲಾಗ್ ಔಟ್", notifications: "ಅಧಿಸೂಚನೆಗಳು", today: "ಇಂದು", viewAllOrders: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳನ್ನು ನೋಡಿ", addProduct: "ಉತ್ಪನ್ನ ಸೇರಿಸಿ", recentAlerts: "ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು", markRead: "ಓದಿದಂತೆ ಗುರುತಿಸಿ", accountSettings: "ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು", switchCustomer: "ಗ್ರಾಹಕ ಮೋಡ್", myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು", languageAndVoice: "ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ", tapToSpeak: "ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿ", listening: "ಆಲಿಸುತ್ತಿದೆ...", askAssistant: "ಸಹಾಯಕನನ್ನು ಕೇಳಿ", selectLanguage: "ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", continue: "ಮುಂದುವರಿಸಿ",
  },
  ml: {
    dashboard: "ഡാഷ്ബോർഡ്", products: "ഉൽപ്പന്നങ്ങൾ", orders: "ഓർഡറുകൾ", inventory: "ഇൻവെന്ററി", payments: "പേയ്‌മെന്റുകൾ", customers: "ഉപഭോക്താക്കൾ", shop: "എന്റെ കട", settings: "ക്രമീകരണങ്ങൾ", home: "ഹോം", discover: "തിരയുക", assistant: "സഹായി", profile: "പ്രൊഫൈൽ", cart: "കാർട്ട്", logout: "പുറത്തുകടക്കുക", notifications: "അറിയിപ്പുകൾ", today: "ഇന്ന്", viewAllOrders: "എല്ലാ ഓർഡറുകളും കാണുക", addProduct: "ഉൽപ്പന്നം ചേർക്കുക", recentAlerts: "സമീപകാല അലേർട്ടുകൾ", markRead: "വായിച്ചതായി അടയാളപ്പെടുത്തുക", accountSettings: "അക്കൗണ്ട് ക്രമീകരണങ്ങൾ", switchCustomer: "ഉപഭോക്തൃ മോഡ്", myOrders: "എന്റെ ഓർഡറുകൾ", languageAndVoice: "ഭാഷയും ശബ്ദവും", tapToSpeak: "സംസാരിക്കാൻ മൈക്രോഫോൺ അമർത്തുക", listening: "കേൾക്കുന്നു...", askAssistant: "സഹായിയോട് ചോദിക്കുക", selectLanguage: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക", continue: "തുടരുക",
  },
  gu: {
    dashboard: "ડેશબોર્ડ", products: "ઉત્પાદનો", orders: "ઓર્ડર", inventory: "સ્ટોક", payments: "ચુકવણી", customers: "ગ્રાહકો", shop: "મારી દુકાન", settings: "સેટિંગ્સ", home: "હોમ", discover: "શોધો", assistant: "સહાયક", profile: "પ્રોફાઇલ", cart: "કાર્ટ", logout: "લૉગ આઉટ", notifications: "સૂચનાઓ", today: "આજે", viewAllOrders: "બધા ઓર્ડર જુઓ", addProduct: "ઉત્પાદન ઉમેરો", recentAlerts: "તાજેતરની સૂચનાઓ", markRead: "વાંચેલું કરો", accountSettings: "ખાતા સેટિંગ્સ", switchCustomer: "ગ્રાહક મોડ", myOrders: "મારા ઓર્ડર", languageAndVoice: "ભાષા અને અવાજ", tapToSpeak: "બોલવા માટે માઇક્રોફોન દબાવો", listening: "સાંભળી રહ્યું છે...", askAssistant: "સહાયકને પૂછો", selectLanguage: "તમારી ભાષા પસંદ કરો", continue: "ચાલુ રાખો",
  },
};

export function t(language: SupportedLanguage | undefined, key: TranslationKey): string {
  return translations[language || "en"][key] || translations.en[key];
}

export function languageLocale(language: SupportedLanguage | undefined): string {
  return LANGUAGE_OPTIONS.find((option) => option.code === (language || "en"))?.locale || "en-IN";
}

export const assistantVoiceQueries: Record<SupportedLanguage, string> = {
  en: "Show nearby grocery shops and rice prices",
  hi: "मेरे आस-पास किराने की दुकानें और चावल के दाम दिखाओ",
  bn: "আমার কাছের মুদির দোকান এবং চালের দাম দেখাও",
  ta: "எனக்கு அருகிலுள்ள மளிகைக் கடைகளையும் அரிசி விலைகளையும் காட்டு",
  te: "నా దగ్గరలోని కిరాణా దుకాణాలు మరియు బియ్యం ధరలు చూపించు",
  mr: "माझ्या जवळची किराणा दुकाने आणि तांदळाचे दर दाखवा",
  kn: "ನನ್ನ ಹತ್ತಿರದ ಕಿರಾಣಿ ಅಂಗಡಿಗಳು ಮತ್ತು ಅಕ್ಕಿ ಬೆಲೆಗಳನ್ನು ತೋರಿಸಿ",
  ml: "എന്റെ അടുത്തുള്ള പലചരക്ക് കടകളും അരിയുടെ വിലകളും കാണിക്കുക",
  gu: "મારી નજીકની કરિયાણાની દુકાનો અને ચોખાના ભાવ બતાવો",
};
