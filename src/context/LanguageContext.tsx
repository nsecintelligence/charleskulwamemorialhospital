import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; sw: string }> = {
  // Navigation
  'nav.home': { en: 'Home', sw: 'Nyumbani' },
  'nav.about': { en: 'About Us', sw: 'Kuhusu Sisi' },
  'nav.services': { en: 'Services', sw: 'Huduma' },
  'nav.clinic': { en: 'Clinic', sw: 'Kliniki' },
  'nav.departments': { en: 'Departments', sw: 'Idara' },
  'nav.doctors': { en: 'Doctors', sw: 'Madaktari' },
  'nav.hms': { en: 'HMS', sw: 'HMS' },
  'nav.gallery': { en: 'Gallery', sw: 'Picha' },
  'nav.news': { en: 'News', sw: 'Habari' },
  'nav.faq': { en: 'FAQ', sw: 'Maswali' },
  'nav.contact': { en: 'Contact', sw: 'Mawasiliano' },

  // Top bar
  'topbar.emergency': { en: 'Emergency', sw: 'Dharura' },
  'topbar.workingHours': { en: 'Mon-Sun: 24/7', sw: 'Jumatatu-Jumapili: 24/7' },

  // Footer
  'footer.tagline': { en: 'Providing world-class healthcare with compassion and excellence since 1985.', sw: 'Kutoa huduma ya afya ya kiwango cha juu kwa huruma na ubora tangu 1985.' },
  'footer.quickLinks': { en: 'Quick Links', sw: 'Viungo vya Haraka' },
  'footer.contactInfo': { en: 'Contact Info', sw: 'Mawasiliano' },
  'footer.followUs': { en: 'Follow Us', sw: 'Tufuate' },
  'footer.rights': { en: 'All rights reserved.', sw: 'Haki zote zimehifadhiwa.' },
  'footer.address': { en: 'Address', sw: 'Anwani' },
  'footer.phone': { en: 'Phone', sw: 'Simu' },
  'footer.email': { en: 'Email', sw: 'Barua Pepe' },

  // Common
  'common.bookAppointment': { en: 'Book an Appointment', sw: 'Panga Miadi' },
  'common.ourServices': { en: 'Our Services', sw: 'Huduma Zetu' },
  'common.viewAll': { en: 'View All', sw: 'Angalia Zote' },
  'common.learnMore': { en: 'Learn more', sw: 'Jifunze zaidi' },
  'common.allNews': { en: 'All News', sw: 'Habari Zote' },
  'common.callEmergency': { en: 'Call Emergency', sw: 'Piga Dharura' },

  // Home page
  'home.heroBadge': { en: '24/7 Emergency & Specialist Care', sw: 'Dharura 24/7 & Huduma ya Wataalamu' },
  'home.heroText': { en: 'Compassionate, high-quality healthcare with modern facilities, experienced professionals, and patient-first service.', sw: 'Huduma ya afya yenye huruma na ubora wa juu, vifaa vya kisasa, wataalamu wenye uzoefu, na kipaumbele kwa mgonjwa.' },
  'home.stats.emergency': { en: 'Emergency Care', sw: 'Huduma ya Dharura' },
  'home.stats.staff': { en: 'Medical Staff', sw: 'Wafanyakazi wa Tiba' },
  'home.stats.years': { en: 'Years of Service', sw: 'Miaka ya Huduma' },
  'home.stats.departments': { en: 'Departments', sw: 'Idara' },
  'home.services.title': { en: 'Our Services', sw: 'Huduma Zetu' },
  'home.services.subtitle': { en: 'Comprehensive healthcare services delivered with cutting-edge technology and compassionate care.', sw: 'Huduma kamili za afya zinazotolewa kwa teknolojia ya kisasa na huduma yenye huruma.' },
  'home.insurance.badge': { en: 'Insurance Partners', sw: 'Washirika wa Bima' },
  'home.insurance.title': { en: 'Insurance Services', sw: 'Huduma za Bima' },
  'home.insurance.subtitle': { en: 'We work with major insurance providers to ensure accessible and affordable healthcare for all our patients.', sw: 'Tunafanya kazi na watoa bima wakuu kuhakikisha huduma ya afya inayopatikana na bei nafuu kwa wagonjwa wetu wote.' },
  'home.insurance.info': { en: 'We accept multiple insurance plans. Contact us to verify your coverage and benefits.', sw: 'Tunakubali mipango mingi ya bima. Wasiliana nasi kuthibitisha bima yako na faida.' },
  'home.insurance.verify': { en: 'Verify Your Insurance', sw: 'Thibitisha Bima Yako' },
  'home.news.title': { en: 'Latest News', sw: 'Habari za Karibuni' },
  'home.news.subtitle': { en: 'Stay updated with the latest happenings at our hospital.', sw: 'Kaa sawa na matukio ya karibuni katika hospitali yetu.' },
  'home.help.title': { en: 'Need Help?', sw: 'Unahitaji Msaada?' },
  'home.help.subtitle': { en: 'Our team is here to help you. Reach out for appointments, inquiries, or emergency assistance.', sw: 'Timu yetu iko hapa kukusaidia. Wasiliana nasi kwa miadi, maswali, au msaada wa dharura.' },
  'home.help.call': { en: 'Call Us', sw: ' tupigie' },
  'home.help.email': { en: 'Email Us', sw: 'Tuandikie' },
  'home.help.visit': { en: 'Visit Us', sw: 'Kutembelea' },
  'home.help.respond': { en: 'We typically respond within 24 hours.', sw: 'Kwa kawaida tunajibu ndani ya saa 24.' },

  // Departments page
  'departments.title': { en: 'Our Departments', sw: 'Idara Zetu' },
  'departments.subtitle': { en: 'Specialized care across every medical discipline.', sw: 'Huduma maalum katika kila taaluma ya matibabu.' },

  // Contact page
  'contact.title': { en: 'Contact Us', sw: 'Wasiliana Nasi' },
  'contact.subtitle': { en: 'We are here to help. Reach out anytime.', sw: 'Tuko hapa kukusaidia. Wasiliana nasi wakati wowote.' },
  'contact.getInTouch': { en: 'Get in Touch', sw: 'Pata Mawasiliano' },
  'contact.sendMessage': { en: 'Send a Message', sw: 'Tuma Ujumbe' },
  'contact.messageSent': { en: 'Message Sent!', sw: 'Ujumbe Umetumwa!' },
  'contact.messageSentDesc': { en: 'Thank you for reaching out. We will get back to you soon.', sw: 'Asante kwa kuwasiliana. Tutakurudishia jibu hivi karibuni.' },
  'contact.fullName': { en: 'Full Name', sw: 'Jina Kamili' },
  'contact.subject': { en: 'Subject', sw: 'Mada' },
  'contact.message': { en: 'Message', sw: 'Ujumbe' },
  'contact.send': { en: 'Send Message', sw: 'Tuma Ujumbe' },
  'contact.workingHours': { en: 'Working Hours', sw: 'Saa za Kazi' },
  'contact.outpatient': { en: 'Outpatient: Mon-Fri 8AM - 6PM', sw: 'Wagonjwa wa nje: Jumatatu-Ijumaa 8AM - 6PM' },
  'contact.emergency247': { en: 'Emergency: 24/7', sw: 'Dharura: 24/7' },
  'contact.bookAppointment': { en: 'Book an Appointment', sw: 'Panga Miadi' },
  'contact.bookDesc': { en: 'Schedule a visit with one of our specialists.', sw: 'Panga ziara na mmoja wa wataalamu wetu.' },
  'contact.patientName': { en: 'Patient Name', sw: 'Jina la Mgonjwa' },
  'contact.patientPhone': { en: 'Phone Number', sw: 'Nambari ya Simu' },
  'contact.patientEmail': { en: 'Email (optional)', sw: 'Barua Pepe (si lazima)' },
  'contact.selectDept': { en: 'Select Department', sw: 'Chagua Idara' },
  'contact.preferredDate': { en: 'Preferred Date', sw: 'Tarehe Unayopendelea' },
  'contact.preferredTime': { en: 'Preferred Time', sw: 'Saa Unayopendelea' },
  'contact.additionalMsg': { en: 'Additional Message (optional)', sw: 'Ujumbe Ziada (si lazima)' },
  'contact.submitBooking': { en: 'Submit Booking Request', sw: 'Tuma Ombi la Miadi' },
  'contact.bookingSent': { en: 'Booking Request Sent!', sw: 'Ombi la Miadi Limetumwa!' },
  'contact.bookingSentDesc': { en: 'Your appointment request has been submitted. We will call you shortly to confirm.', sw: 'Ombi lako la miadi limewasilishwa. Tutakupigia simu hapo karibuni kuthibitisha.' },
  'contact.bookingError': { en: 'There was an error submitting your request. Please try again or call us.', sw: 'Kulikuwa na hitilafu katika kuwasilisha ombi lako. Tafadhali jaribu tena au tupigie simu.' },

  // Doctors page
  'doctors.title': { en: 'Our Specialist Doctors', sw: 'Madaktari Bingwa Wetu' },
  'doctors.subtitle': { en: 'Experienced specialists dedicated to your health and wellbeing.', sw: 'Wataalamu wenye uzoefu waliobobea katika afya yako.' },
  'doctors.all': { en: 'All Specialties', sw: 'Maeneo Yote' },
  'doctors.noDoctors': { en: 'No doctors available at the moment.', sw: 'Hakuna madaktari wanaopatikana kwa sasa.' },
  'doctors.bookWith': { en: 'Book with this Doctor', sw: 'Panga na Daktari huyu' },
  'doctors.schedule': { en: 'Schedule', sw: 'Ratiba' },
  'doctors.contact': { en: 'Contact', sw: 'Mawasiliano' },
  'doctors.days': { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], sw: ['Jpl', 'Jt', 'Jn', 'Jtano', 'Alh', 'Iju', 'Jmn'] },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hospital-language');
      if (saved === 'en' || saved === 'sw') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hospital-language', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function getTranslatedArray(key: string, lang: Language): string[] {
  const entry = translations[key];
  if (!entry) return [];
  const val = entry[lang];
  return Array.isArray(val) ? val : [];
}
