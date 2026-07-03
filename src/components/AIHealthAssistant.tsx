import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Globe, Phone, Clock, MapPin, FileText, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactInfo, Department, Service, FAQ, ServicePrice, DownloadableForm } from '../types';

type Language = 'en' | 'sw';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const translations = {
  en: {
    title: 'AI Health Assistant',
    placeholder: 'Ask me anything about our hospital...',
    welcome: 'Hello! I am your AI Health Assistant. How can I help you today? You can ask about departments, services, appointments, visiting hours, prices, or download forms.',
    quickActions: [
      'Departments',
      'Services',
      'Book Appointment',
      'Visiting Hours',
      'Contact Info',
      'Prices',
      'Forms',
      'First Aid Tips',
    ],
    suggestions: {
      departments: 'Our departments include',
      services: 'We offer services including',
      appointments: 'To book an appointment, please provide your name, phone, preferred date and department.',
      visitingHours: 'Visiting hours are',
      contact: 'You can reach us at',
      prices: 'Here are our service prices',
      forms: 'You can download these forms',
      firstAid: 'Here are some basic first aid tips',
      emergency: 'For emergencies, please call',
      default: 'I can help you with information about departments, services, appointments, visiting hours, contact info, prices, forms, or first aid tips. What would you like to know?',
    },
  },
  sw: {
    title: 'Msaidizi wa Afya AI',
    placeholder: 'Niulize chochote kuhusu hospitali yetu...',
    welcome: 'Habari! Mimi ni Msaidizi wako wa Afya wa AI. Ninawezaje kukusaidia leo? Unaweza kuuliza kuhusu idara, huduma, miadi, saa za ziara, bei, au kupakua fomu.',
    quickActions: [
      'Idara',
      'Huduma',
      'Panga Miadi',
      'Saa za Ziara',
      'Mawasiliano',
      'Bei',
      'Fomu',
      'Msaada wa Kwanza',
    ],
    suggestions: {
      departments: 'Idara zetu ni pamoja na',
      services: 'Tunatoa huduma ikiwa ni pamoja na',
      appointments: 'Kupanga miadi, tafadhali toa jina lako, nambari ya simu, tarehe unayopenda na idara.',
      visitingHours: 'Saa za ziara ni',
      contact: 'Unaweza kutupata kwa',
      prices: 'Hapa kuna bei za huduma zetu',
      forms: 'Unaweza kupakua fomu hizi',
      firstAid: 'Hapa kuna vidokezo vya msaada wa kwanza',
      emergency: 'Kwa dharura, tafadhali piga simu',
      default: 'Ninaweza kukusaidia kwa taarifa kuhusu idara, huduma, miadi, saa za ziara, mawasiliano, bei, fomu, au vidokezo vya msaada wa kwanza. Ungependa kujua nini?',
    },
  },
};

 const firstAidTips = {
  en: [
    { title: 'Cuts and Wounds', content: 'Apply direct pressure with a clean cloth. Elevate the wound above heart level. Seek medical help if bleeding doesn\'t stop after 10 minutes.' },
    { title: 'Burns', content: 'Cool the burn under running water for at least 10 minutes. Do not apply ice, butter, or creams. Cover with a clean, non-fluffy dressing.' },
    { title: 'Choking', content: 'For adults: Stand behind and perform abdominal thrusts (Heimlich maneuver). For infants: Support head and deliver 5 back blows.' },
    { title: 'Fainting', content: 'Lay person on their back with legs elevated. Loosen tight clothing. Check breathing and pulse. Do not give food or water.' },
    { title: 'Fractures', content: 'Keep the injured area still. Apply ice wrapped in cloth. Do not try to straighten the bone. Seek immediate medical attention.' },
  ],
  sw: [
    { title: 'Mikwaruzo na Vidonda', content: 'Bonyeza moja kwa moja na kitambaa safi. Inue kidonda juu ya kiwango cha moyo. Tafuta msaada wa matibabu ikiwa damu haijachacha baada ya dakika 10.' },
    { title: 'Ngozi ya kuchoma', content: 'Baridisha eneo la kuchoma chini ya maji yanayotiririka kwa angalau dakika 10. Usitumie barafu, siagi, au marashi. Funika na uwekaji safi.' },
    { title: 'Kukwama', content: 'Kwa watu wazima: Simama nyuma na fanya kumsukuma tumbo. Kwa watoto wachanga: Shikilia kichwa na piga pingaizi 5 mgongoni.' },
    { title: 'Kuzimia', content: 'Mlaze mtu mgoni pake na kwinua miguu. Fungua nguo zilizokazika. Angalia kupumua na mapigo. Usipe chakula au maji.' },
    { title: 'Mifupa iliyovunjika', content: 'Hifadhi eneo lililojeruhiwa lisilikike. Weka barafu iliyofunikwa na kitambaa. Usijaribu kunyoosha mfupa. Tafuta msaada wa matibabu mara moja.' },
  ],
};

export default function AIHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    department: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Data from database
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [forms, setForms] = useState<DownloadableForm[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    const [contactRes, deptRes, svcRes, faqRes, priceRes, formRes] = await Promise.all([
      supabase.from('contact_info').select('*').maybeSingle(),
      supabase.from('departments').select('*').order('sort_order'),
      supabase.from('services').select('*').order('sort_order'),
      supabase.from('faq').select('*').order('sort_order'),
      supabase.from('service_prices').select('*').eq('is_active', true),
      supabase.from('downloadable_forms').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (contactRes.data) setContactInfo(contactRes.data);
    if (deptRes.data) setDepartments(deptRes.data);
    if (svcRes.data) setServices(svcRes.data);
    if (faqRes.data) setFaqs(faqRes.data);
    if (priceRes.data) setPrices(priceRes.data);
    if (formRes.data) setForms(formRes.data);
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        text: t.welcome,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, language]);

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const isSwahili = language === 'sw';

    // Department queries
    if (input.includes('department') || input.includes('idara')) {
      const deptList = departments.map(d => d.name).join(', ');
      return `${isSwahili ? 'Idara zetu ni pamoja na' : 'Our departments include'}: ${deptList || 'General Medicine, Surgery, Pediatrics, Obstetrics, Emergency Care'}. ${isSwahili ? 'Ni ipi unayohitaji kujua zaidi?' : 'Which one would you like to know more about?'}`;
    }

    // Services queries
    if (input.includes('service') || input.includes('huduma')) {
      const svcList = services.slice(0, 5).map(s => s.name).join(', ');
      return `${isSwahili ? 'Tunatoa huduma ikiwa ni pamoja na' : 'We offer services including'}: ${svcList || 'Consultations, Laboratory, X-Ray, Pharmacy, Emergency Care'}. ${isSwahili ? 'Ungependa maelezo zaidi?' : 'Would you like more details?'}`;
    }

    // Appointment queries
    if (input.includes('appointment') || input.includes('miadi') || input.includes('book') || input.includes('panga')) {
      setShowAppointmentForm(true);
      return isSwahili
        ? 'Kupanga miadi, tafadhali jaza fomu hapa chini. Tutakupigia simu kuthibitisha.'
        : 'To book an appointment, please fill in the form below. We will call you to confirm.';
    }

    // Visiting hours
    if (input.includes('hour') || input.includes('saa') || input.includes('visit') || input.includes('ziara')) {
      return isSwahili
        ? `Saa za ziara: Jumatatu hadi Ijumaa: 10:00 asubuhi - 8:00 jioni, Jumamosi na Jumapili: 10:00 asubuhi - 6:00 jioni. Saa za dharura: 24/7.`
        : `Visiting hours: Mon-Fri: 10:00 AM - 8:00 PM, Sat-Sun: 10:00 AM - 6:00 PM. Emergency: 24/7.`;
    }

    // Contact queries
    if (input.includes('contact') || input.includes('phone') || input.includes('email') || input.includes('mawasiliano') || input.includes('simu')) {
      return isSwahili
        ? `Mawasiliano: Simu: ${contactInfo?.phone || '+255 123 456 789'}, Dharura: ${contactInfo?.emergency_phone || '+255 911'}, Barua: ${contactInfo?.email || 'info@hospital.com'}`
        : `Contact us: Phone: ${contactInfo?.phone || '+255 123 456 789'}, Emergency: ${contactInfo?.emergency_phone || '+255 911'}, Email: ${contactInfo?.email || 'info@hospital.com'}`;
    }

    // Address
    if (input.includes('address') || input.includes('location') || input.includes('mahali') || input.includes('eneo')) {
      return isSwahili
        ? `Mahali: ${contactInfo?.address || 'Hospitali iko katikati ya jiji'}. Tunaweza kukupeleka kwa dalili za barabara.`
        : `Our address: ${contactInfo?.address || 'Hospital located in the city center'}. We can provide directions.`;
    }

    // Price queries
    if (input.includes('price') || input.includes('cost') || input.includes('fee') || input.includes('bei')) {
      if (prices.length > 0) {
        const priceList = prices.slice(0, 5).map(p => `${p.service_name}: ${p.currency} ${p.price.toLocaleString()}`).join('\n');
        return `${isSwahili ? 'Bei za huduma:' : 'Service prices:'}\n${priceList}\n\n${isSwahili ? 'Angalia ukurasa wa bei kwa orodha kamili.' : 'Check the prices page for a full list.'}`;
      }
      return isSwahili
        ? 'Kwa maonyo ya bei, tafadhali piga simu kwenye mpokeaji wetu. Bei zinategemea matibabu yanayohitajika.'
        : 'For accurate pricing, please call our reception. Prices depend on required treatments.';
    }

    // Forms queries
    if (input.includes('form') || input.includes('download') || input.includes('fomu')) {
      if (forms.length > 0) {
        const formList = forms.map(f => `- ${f.name}`).join('\n');
        return `${isSwahili ? 'Fomu zinazopakuliwa:' : 'Downloadable forms:'}\n${formList}\n\n${isSwahili ? 'Gusa moja kupakua.' : 'Tap one to download.'}`;
      }
      return isSwahili
        ? 'Fomu zinapatikana kwenye ofisi yetu. Unaweza kupakua fomu za usajili, bima, na zingine.'
        : 'Forms are available at our office. You can download registration, insurance, and other forms.';
    }

    // First aid queries
    if (input.includes('first aid') || input.includes('msaada wa kwanza') || input.includes('emergency') || input.includes('dharura')) {
      const tips = firstAidTips[language];
      const tipsList = tips.map(t => `**${t.title}**: ${t.content}`).join('\n\n');
      return `${isSwahili ? 'Vidokezo vya msaada wa kwanza:' : 'Basic first aid tips:'}\n\n${tipsList}\n\n${isSwahili ? 'Kwa dharura, piga simu: ' + (contactInfo?.emergency_phone || '+255 911') : 'For emergencies, call: ' + (contactInfo?.emergency_phone || '+255 911')}`;
    }

    // FAQ queries
    if (input.includes('faq') || input.includes('question') || input.includes('swali')) {
      if (faqs.length > 0) {
        const faqList = faqs.slice(0, 3).map(f => `${isSwahili ? 'S' : 'Q'}: ${f.question}\n${isSwahili ? 'J' : 'A'}: ${f.answer}`).join('\n\n');
        return faqList;
      }
      return isSwahili
        ? 'Tembelea ukurasa wa Maswali ya Kawaida kwa majibu zaidi.'
        : 'Visit our FAQ page for more answers to common questions.';
    }

    // Emergency
    if (input.includes('emergency') || input.includes('dharura')) {
      return isSwahili
        ? `KWA DHARURA: Piga simu ${contactInfo?.emergency_phone || '+255 911'} AU nenda moja kwa moja kwenye chumba cha dharura. Emergency: 24/7.`
        : `FOR EMERGENCIES: Call ${contactInfo?.emergency_phone || '+255 911'} OR go directly to the Emergency Room. Emergency: 24/7.`;
    }

    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('jambo') || input.includes('habari') || input.includes('salam')) {
      return isSwahili
        ? 'Jambo! Karibu hospitali yetu. Ninawezaje kukusaidia leo? Niulize kuhusu idara, huduma, miadi, au chochote kingine.'
        : 'Hello! Welcome to our hospital. How can I help you today? Ask me about departments, services, appointments, or anything else.';
    }

    // Thank you
    if (input.includes('thank') || input.includes('asante') || input.includes('shukran')) {
      return isSwahili
        ? 'Karibu sana! Kuna kitu kingine ninachoweza kukusaidia?'
        : 'You\'re welcome! Is there anything else I can help you with?';
    }

    // Default response
    return t.suggestions.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowAppointmentForm(false);

    setTimeout(() => {
      const response = generateResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleQuickAction = (action: string) => {
    const actionInput = action === 'Book Appointment' || action === 'Panga Miadi'
      ? (language === 'sw' ? 'nataka panga miadi' : 'book appointment')
      : action.toLowerCase();
    setInput(actionInput);
    handleSend();
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('appointments').insert(appointmentData);
    if (!error) {
      const successMsg = language === 'sw'
        ? 'Miadi yako imetumwa! Tutakupigia simu hapo karibute kuthibitisha.'
        : 'Your appointment request has been submitted! We will call you shortly to confirm.';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text: successMsg,
        timestamp: new Date(),
      }]);
      setAppointmentData({ patient_name: '', patient_phone: '', patient_email: '', department: '', preferred_date: '', preferred_time: '', message: '' });
      setShowAppointmentForm(false);
    } else {
      const errorMsg = language === 'sw'
        ? 'Kuna hitilafu. Tafadhali jaribu tena au tupigie simu.'
        : 'There was an error. Please try again or call us directly.';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text: errorMsg,
        timestamp: new Date(),
      }]);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      text: language === 'en' ? translations.sw.welcome : translations.en.welcome,
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-700 text-white shadow-lg flex items-center justify-center hover:bg-green-800 transition-all ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Health Assistant"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          bottom: '16px',
          right: '16px',
          width: 'calc(100vw - 32px)',
          maxWidth: '400px',
          height: 'calc(100vh - 100px)',
          maxHeight: '600px',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <span className="font-semibold">{t.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-xs"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'SW' : 'EN'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-green-700 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-md border shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Form */}
            {showAppointmentForm && (
              <form onSubmit={handleAppointmentSubmit} className="bg-white rounded-xl p-3 border shadow-sm space-y-2">
                <input
                  type="text"
                  placeholder={language === 'sw' ? 'Jina lako *' : 'Your Name *'}
                  value={appointmentData.patient_name}
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder={language === 'sw' ? 'Nambari ya simu *' : 'Phone Number *'}
                  value={appointmentData.patient_phone}
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder={language === 'sw' ? 'Barua pepe (si lazima)' : 'Email (optional)'}
                  value={appointmentData.patient_email}
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <select
                  value={appointmentData.department}
                  onChange={(e) => setAppointmentData({ ...appointmentData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                >
                  <option value="">{language === 'sw' ? 'Chagua Idara' : 'Select Department'}</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  <option value="General">{language === 'sw' ? 'Mataratibu ya Jumla' : 'General'}</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={appointmentData.preferred_date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, preferred_date: e.target.value })}
                    required
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={appointmentData.preferred_time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, preferred_time: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
                <textarea
                  placeholder={language === 'sw' ? 'Ujumbe (si lazima)' : 'Message (optional)'}
                  value={appointmentData.message}
                  onChange={(e) => setAppointmentData({ ...appointmentData, message: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 text-sm">
                  {language === 'sw' ? 'Tuma Ombi' : 'Submit Request'}
                </button>
              </form>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-2 py-2 border-t bg-white overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {t.quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-2 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
