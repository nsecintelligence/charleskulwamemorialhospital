import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Stethoscope } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactInfo, Department, Service, FAQ, ServicePrice, DownloadableForm } from '../types';
import { healthTopics } from '../data/healthTopics';
import { useLanguage, type Language } from '../context/LanguageContext';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const translations = {
  en: {
    title: 'AI Health Assistant',
    placeholder: 'Ask about our hospital or health topics...',
    welcome: "Hello! I am your AI Health Assistant. I can help you with hospital information (departments, services, appointments, prices, forms) and health education (infectious diseases, cancer, HIV/AIDS, women's health, blood pressure, nutrition, and disease prevention). You can also use the Symptoms Checker. How can I help you today?",
    quickActions: [
      'Departments', 'Services', 'Book Appointment', 'Prices',
      'Infectious Diseases', 'Cancer Awareness', 'HIV & AIDS',
      "Women's Health", 'Blood Pressure', 'Nutrition', 'Disease Prevention', 'First Aid',
    ],
    symptomsChecker: 'Symptoms Checker',
    default: "I can help you with hospital info (departments, services, appointments, visiting hours, contact, prices, forms) or health education (infectious diseases, cancer, HIV/AIDS, women's health, blood pressure, nutrition, disease prevention, and first aid). What would you like to know?",
  },
  sw: {
    title: 'Msaidizi wa Afya AI',
    placeholder: 'Uliza kuhusu hospitali au mada za afya...',
    welcome: "Habari! Mimi ni Msaidizi wako wa Afya wa AI. Ninaweza kukusaidia kwa taarifa za hospitali (idara, huduma, miadi, bei, fomu) na elimu ya afya (magonjwa ya kuambukizwa, saratani, VVU/UKIMWI, afya ya wanawake, shinikizo la damu, lishe, na kuzuia magonjwa). Unaweza pia kutumia Kipimo cha Dalili. Ninawezaje kukusaidia leo?",
    quickActions: [
      'Idara', 'Huduma', 'Panga Miadi', 'Bei',
      'Magonjwa ya Kuambukizwa', 'Ufahamu wa Saratani', 'VVU & UKIMWI',
      'Afya ya Wanawake', 'Shinikizo la Damu', 'Lishe', 'Kuzuia Magonjwa', 'Msaada wa Kwanza',
    ],
    symptomsChecker: 'Kipimo cha Dalili',
    default: 'Ninaweza kukusaidia kwa taarifa za hospitali (idara, huduma, miadi, saa za ziara, mawasiliano, bei, fomu) au elimu ya afya (magonjwa ya kuambukizwa, saratani, VVU/UKIMWI, afya ya wanawake, shinikizo la damu, lishe, kuzuia magonjwa, na msaada wa kwanza). Ungependa kujua nini?',
  },
};

const firstAidTips = {
  en: [
    { title: 'Cuts and Wounds', content: "Apply direct pressure with a clean cloth. Elevate the wound above heart level. Seek medical help if bleeding doesn't stop after 10 minutes." },
    { title: 'Burns', content: 'Cool the burn under running water for at least 10 minutes. Do not apply ice, butter, or creams. Cover with a clean, non-fluffy dressing.' },
    { title: 'Choking', content: 'For adults: Stand behind and perform abdominal thrusts (Heimlich maneuver). For infants: Support head and deliver 5 back blows.' },
    { title: 'Fainting', content: 'Lay person on their back with legs elevated. Loosen tight clothing. Check breathing and pulse. Do not give food or water.' },
    { title: 'Fractures', content: 'Keep the injured area still. Apply ice wrapped in cloth. Do not try to straighten the bone. Seek immediate medical attention.' },
  ],
  sw: [
    { title: 'Mikwaruzo na Vidonda', content: 'Bonyeza moja kwa moja na kitambaa safi. Inue kidonda juu ya kiwango cha moyo. Tafuta msaada wa matibabu ikiwa damu haijachacha baada ya dakika 10.' },
    { title: 'Ngozi ya kuchoma', content: 'Baridisha eneo la kuchoma chini ya maji yanayotiririka kwa angalau dakika 10. Usitumie barafu, siagi, au marashi. Funika na uwekaji safi.' },
    { title: 'Kukwama', content: 'Kwa watu wazima: Simama nyuma na fanya kumsukuma tumbo. Kwa watoto wachanga: Shikilia kichwa na piga pingaizi 5 mgongoni.' },
    { title: 'Kuzimia', content: 'Mlaze mtu mgongo na kwinua miguu. Fungua nguo zilizokazika. Angalia kupumua na mapigo. Usipe chakula au maji.' },
    { title: 'Mifupa iliyovunjika', content: 'Hifadhi eneo lililojeruhiwa lisilikike. Weka barafu iliyofunikwa na kitambaa. Usijaribu kunyoosha mfupa. Tafuta msaada wa matibabu mara moja.' },
  ],
};

// Symptoms checker data
interface SymptomGroup {
  id: string;
  label: { en: string; sw: string };
  symptoms: { id: string; label: { en: string; sw: string }; dept: string; advice: { en: string; sw: string } }[];
}

const symptomGroups: SymptomGroup[] = [
  {
    id: 'head-neck',
    label: { en: 'Head & Neck', sw: 'Kichwa na Shingo' },
    symptoms: [
      { id: 'headache', label: { en: 'Severe or persistent headache', sw: 'Kichwa kuuma sana au kwa muda mrefu' }, dept: 'General Consultation', advice: { en: 'A persistent or severe headache may indicate migraine, high blood pressure, or other conditions. Rest in a quiet, dark room and seek medical attention if it worsens.', sw: 'Kichwa kuuma kwa muda mrefu au sana kunaweza kuashiria migraine, shinikizo la damu, au hali nyingine. Pumzika sehemu tulivu na tafuta matibabu ikiwa inazidi.' } },
      { id: 'fever', label: { en: 'Fever', sw: 'Homa' }, dept: 'General Consultation', advice: { en: 'Fever is often a sign of infection. Rest, drink plenty of fluids, and take paracetamol. Seek immediate care if fever is very high, persists beyond 3 days, or is accompanied by stiff neck or confusion.', sw: 'Homa mara nyingi ni ishara ya maambukizi. Pumzika, kunywa maji mengi, na chukua paracetamol. Tafuta matibabu mara moja ikiwa homa ni juu sana, inaendelea zaidi ya siku 3, au inambatana na shingo kukakamaa au kuchanganyikiwa.' } },
      { id: 'sore-throat', label: { en: 'Sore throat', sw: 'Koo kuuma' }, dept: 'General Consultation', advice: { en: 'A sore throat may be viral or bacterial. Gargle warm salt water and rest your voice. See a doctor if it lasts over 3 days or you have difficulty swallowing.', sw: 'Koo kuuma kunaweza kuwa cha virusi au bakteria. Sungulia maji ya chumvi ya vuguvugu na pumzika sauti. Muone daktari ikiwa inadumu zaidi ya siku 3 au una shida ya kumeza.' } },
      { id: 'vision', label: { en: 'Vision changes or eye pain', sw: 'Mabadiliko ya kuona au maumivu ya jicho' }, dept: 'General Consultation', advice: { en: 'Sudden vision changes or eye pain need prompt evaluation. Do not rub the eye. Protect from bright light.', sw: 'Mabadiliko ya ghafla ya kuona au maumivu ya jicho yanahitaji uchunguzi wa haraka. Usisugue jicho. Linda kutoka mwanga mkali.' } },
    ],
  },
  {
    id: 'chest-breathing',
    label: { en: 'Chest & Breathing', sw: 'Kifua na Kupumua' },
    symptoms: [
      { id: 'chest-pain', label: { en: 'Chest pain or pressure', sw: 'Maumivu au shinikizo la kifua' }, dept: 'Emergency Care', advice: { en: 'Chest pain can be a sign of a heart attack. Call emergency immediately. Sit down, stay calm, and loosen clothing. Do not drive yourself.', sw: 'Maumivu ya kifua yanaweza kuwa ishara ya heart attack. Piga simu ya dharura mara moja. Keti, tulia, na fungua nguo. Usijisafirishe mwenyewe.' } },
      { id: 'short-breath', label: { en: 'Shortness of breath', sw: 'Kupumua kwa shida' }, dept: 'Emergency Care', advice: { en: 'Difficulty breathing may indicate asthma, pneumonia, or heart problems. Seek immediate medical attention, especially if it comes on suddenly.', sw: 'Kupumua kwa shida kunaweza kuashiria asthma, nimonia, au matatizo ya moyo. Tafuta matibabu ya haraka, hasa ikiwa inaanza ghafla.' } },
      { id: 'cough', label: { en: 'Persistent cough', sw: 'Kikohozi kisichoisha' }, dept: 'General Consultation', advice: { en: 'A cough lasting over 2 weeks may indicate TB or other conditions. Get tested, especially if you cough blood or have night sweats.', sw: 'Kikohozi cha zaidi ya wiki 2 kinaweza kuashiria TB au hali nyingine. Pimwa, hasa ikiwa ukohoa damu au una jasho la usiku.' } },
    ],
  },
  {
    id: 'abdomen',
    label: { en: 'Stomach & Abdomen', sw: 'Tumbo' },
    symptoms: [
      { id: 'abdominal-pain', label: { en: 'Abdominal pain', sw: 'Maumivu ya tumbo' }, dept: 'General Surgery', advice: { en: 'Abdominal pain has many causes. Seek immediate care if pain is severe, accompanied by vomiting blood, or if you have a fever.', sw: 'Maumivu ya tumbo yana sababu nyingi. Tafuta matibabu ya haraka ikiwa maumivu ni makali, yanambatana na kutapika damu, au ukiwa na homa.' } },
      { id: 'diarrhea', label: { en: 'Diarrhea', sw: 'Kuhara' }, dept: 'General Consultation', advice: { en: 'Drink ORS or clean fluids to prevent dehydration. Seek care if diarrhea is bloody, lasts over 2 days, or is accompanied by high fever.', sw: 'Kunywa ORS au maji safi kuzuia upungufu wa maji. Tafuta matibabu ikiwa kuhara kuna damu, kinadumu zaidi ya siku 2, au kinambatana na homa kali.' } },
      { id: 'vomiting', label: { en: 'Persistent vomiting', sw: 'Kutapika kisichoisha' }, dept: 'General Consultation', advice: { en: 'Sip small amounts of water. Seek care if vomiting contains blood, is accompanied by severe pain, or lasts over 24 hours.', sw: 'Kunywa maji kidogo kidogo. Tafuta matibabu ikiwa kutapika kuna damu, kinambatana na maumivu makali, au kinadumu zaidi ya saa 24.' } },
    ],
  },
  {
    id: 'general',
    label: { en: 'General Symptoms', sw: 'Dalili za Jumla' },
    symptoms: [
      { id: 'fatigue', label: { en: 'Unusual tiredness or weakness', sw: 'Uchovu au udhaifu usio wa kawaida' }, dept: 'General Consultation', advice: { en: 'Persistent fatigue may indicate anemia, thyroid issues, or other conditions. Eat iron-rich foods and see a doctor for blood tests.', sw: 'Uchovu unaodumu unaweza kuashiria upungufu wa damu, matatizo ya tezi, au hali nyingine. Kula vyakula vyenye chuma na muone daktari kwa vipimo vya damu.' } },
      { id: 'weight-loss', label: { en: 'Unexplained weight loss', sw: 'Kupungua uzito bila sababu' }, dept: 'General Consultation', advice: { en: 'Unexpected weight loss may signal diabetes, thyroid problems, or other conditions. Please see a doctor for evaluation.', sw: 'Kupungua uzito bila sababu kunaweza kuashiria kisukari, matatizo ya tezi, au hali nyingine. Tafadhali muone daktari kwa uchunguzi.' } },
      { id: 'skin-rash', label: { en: 'Skin rash or unusual skin changes', sw: 'Vipele au mabadiliko ya ngozi' }, dept: 'General Consultation', advice: { en: 'A new rash may be an allergic reaction or infection. Note any new foods, medicines, or products. Seek care if it spreads rapidly or is accompanied by fever.', sw: 'Vipele vipya vinaweza kuwa mzio au maambukizi. Kumbuka vyakula, dawa, au bidhaa mpya. Tafuta matibabu ikiwa vinaenea haraka au vinambatana na homa.' } },
      { id: 'lump', label: { en: 'Lump or swelling anywhere on body', sw: 'Kimimo au uvimbe sehemu yoyote' }, dept: 'General Consultation', advice: { en: 'A new lump should be examined by a doctor. Do not ignore it - early detection is important, especially for cancer screening.', sw: 'Kimimo kipya kinapaswa kuangaliwa na daktari. Usikipuuzie - ugunduzi wa mapema ni muhimu, hasa kwa uchunguzi wa saratani.' } },
    ],
  },
];

function formatTopicResponse(topicId: string, lang: Language): string {
  const topic = healthTopics.find(tp => tp.id === topicId);
  if (!topic) return '';
  const c = topic[lang];
  let response = `**${c.label}**\n\n${c.summary}\n\n`;
  c.sections.forEach(s => {
    response += `**${s.heading}**: ${s.body}\n\n`;
  });
  if (c.prevention && c.prevention.length > 0) {
    const heading = lang === 'sw' ? 'Jinsi ya Kuzuia' : 'How to Prevent';
    response += `**${heading}:**\n`;
    c.prevention.forEach((p, i) => {
      response += `${i + 1}. ${p}\n`;
    });
  }
  return response;
}

function matchHealthTopic(input: string, lang: Language): string | null {
  const lower = input.toLowerCase();
  for (const topic of healthTopics) {
    const keywords = topic[lang].keywords;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return formatTopicResponse(topic.id, lang);
      }
    }
    if (lang === 'sw') {
      for (const kw of topic.en.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return formatTopicResponse(topic.id, lang);
        }
      }
    }
  }
  return null;
}

export default function AIHealthAssistant() {
  const { language, t: _t } = useLanguage();
  const lang = language;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState({
    patient_name: '', patient_phone: '', patient_email: '',
    department: '', preferred_date: '', preferred_time: '', message: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [forms, setForms] = useState<DownloadableForm[]>([]);

  useEffect(() => {
    if (isOpen) fetchData();
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

  const t = translations[lang];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: '1', type: 'bot', text: t.welcome, timestamp: new Date() }]);
    }
  }, [isOpen, lang]);

  const quickActionToTopicId: Record<string, string> = {
    'Infectious Diseases': 'infectious-diseases',
    'Cancer Awareness': 'cancer',
    'HIV & AIDS': 'hiv',
    "Women's Health": 'womens-health',
    'Blood Pressure': 'blood-pressure',
    'Nutrition': 'nutrition',
    'Disease Prevention': 'disease-prevention',
    'Magonjwa ya Kuambukizwa': 'infectious-diseases',
    'Ufahamu wa Saratani': 'cancer',
    'VVU & UKIMWI': 'hiv',
    'Afya ya Wanawake': 'womens-health',
    'Shinikizo la Damu': 'blood-pressure',
    'Lishe': 'nutrition',
    'Kuzuia Magonjwa': 'disease-prevention',
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const isSwahili = lang === 'sw';

    const topicResponse = matchHealthTopic(userInput, lang);
    if (topicResponse) return topicResponse;

    if (input.includes('department') || input.includes('idara')) {
      const deptList = departments.map(d => d.name).join(', ');
      return `${isSwahili ? 'Idara zetu ni pamoja na' : 'Our departments include'}: ${deptList || 'General Medicine, Surgery, Pediatrics, Obstetrics, Emergency Care'}. ${isSwahili ? 'Ni ipi unayohitaji kujua zaidi?' : 'Which one would you like to know more about?'}`;
    }

    if (input.includes('service') || input.includes('huduma')) {
      const svcList = services.slice(0, 5).map(s => s.name).join(', ');
      return `${isSwahili ? 'Tunatoa huduma ikiwa ni pamoja na' : 'We offer services including'}: ${svcList || 'Consultations, Laboratory, X-Ray, Pharmacy, Emergency Care'}. ${isSwahili ? 'Ungependa maelezo zaidi?' : 'Would you like more details?'}`;
    }

    if (input.includes('appointment') || input.includes('miadi') || input.includes('book') || input.includes('panga')) {
      setShowAppointmentForm(true);
      return isSwahili
        ? 'Kupanga miadi, tafadhali jaza fomu hapa chini. Tutakupigia simu kuthibitisha.'
        : 'To book an appointment, please fill in the form below. We will call you to confirm.';
    }

    if (input.includes('hour') || input.includes('saa') || input.includes('visit') || input.includes('ziara')) {
      return isSwahili
        ? `Saa za ziara: Jumatatu hadi Ijumaa: 10:00 asubuhi - 8:00 jioni, Jumamosi na Jumapili: 10:00 asubuhi - 6:00 jioni. Saa za dharura: 24/7.`
        : `Visiting hours: Mon-Fri: 10:00 AM - 8:00 PM, Sat-Sun: 10:00 AM - 6:00 PM. Emergency: 24/7.`;
    }

    if (input.includes('contact') || input.includes('phone') || input.includes('email') || input.includes('mawasiliano') || input.includes('simu')) {
      return isSwahili
        ? `Mawasiliano: Simu: ${contactInfo?.phone || '+255 123 456 789'}, Dharura: ${contactInfo?.emergency_phone || '+255 911'}, Barua: ${contactInfo?.email || 'info@hospital.com'}`
        : `Contact us: Phone: ${contactInfo?.phone || '+255 123 456 789'}, Emergency: ${contactInfo?.emergency_phone || '+255 911'}, Email: ${contactInfo?.email || 'info@hospital.com'}`;
    }

    if (input.includes('address') || input.includes('location') || input.includes('mahali') || input.includes('eneo')) {
      return isSwahili
        ? `Mahali: ${contactInfo?.address || 'Hospitali iko katikati ya jiji'}. Tunaweza kukupeleka kwa dalili za barabara.`
        : `Our address: ${contactInfo?.address || 'Hospital located in the city center'}. We can provide directions.`;
    }

    if (input.includes('price') || input.includes('cost') || input.includes('fee') || input.includes('bei')) {
      if (prices.length > 0) {
        const priceList = prices.slice(0, 5).map(p => `${p.service_name}: ${p.currency} ${p.price.toLocaleString()}`).join('\n');
        return `${isSwahili ? 'Bei za huduma:' : 'Service prices:'}\n${priceList}\n\n${isSwahili ? 'Angalia ukurasa wa bei kwa orodha kamili.' : 'Check the prices page for a full list.'}`;
      }
      return isSwahili
        ? 'Kwa maonyo ya bei, tafadhali piga simu kwenye mpokeaji wetu. Bei zinategemea matibabu yanayohitajika.'
        : 'For accurate pricing, please call our reception. Prices depend on required treatments.';
    }

    if (input.includes('form') || input.includes('download') || input.includes('fomu')) {
      if (forms.length > 0) {
        const formList = forms.map(f => `- ${f.name}`).join('\n');
        return `${isSwahili ? 'Fomu zinazopakuliwa:' : 'Downloadable forms:'}\n${formList}\n\n${isSwahili ? 'Gusa moja kupakua.' : 'Tap one to download.'}`;
      }
      return isSwahili
        ? 'Fomu zinapatikana kwenye ofisi yetu. Unaweza kupakua fomu za usajili, bima, na zingine.'
        : 'Forms are available at our office. You can download registration, insurance, and other forms.';
    }

    if (input.includes('first aid') || input.includes('msaada wa kwanza')) {
      const tips = firstAidTips[lang];
      const tipsList = tips.map(tip => `**${tip.title}**: ${tip.content}`).join('\n\n');
      return `${isSwahili ? 'Vidokezo vya msaada wa kwanza:' : 'Basic first aid tips:'}\n\n${tipsList}\n\n${isSwahili ? 'Kwa dharura, piga simu: ' + (contactInfo?.emergency_phone || '+255 911') : 'For emergencies, call: ' + (contactInfo?.emergency_phone || '+255 911')}`;
    }

    if (input.includes('faq') || input.includes('question') || input.includes('swali')) {
      if (faqs.length > 0) {
        const faqList = faqs.slice(0, 3).map(f => `${isSwahili ? 'S' : 'Q'}: ${f.question}\n${isSwahili ? 'J' : 'A'}: ${f.answer}`).join('\n\n');
        return faqList;
      }
      return isSwahili
        ? 'Tembelea ukurasa wa Maswali ya Kawaida kwa majibu zaidi.'
        : 'Visit our FAQ page for more answers to common questions.';
    }

    if (input.includes('emergency') || input.includes('dharura')) {
      return isSwahili
        ? `KWA DHARURA: Piga simu ${contactInfo?.emergency_phone || '+255 911'} AU nenda moja kwa moja kwenye chumba cha dharura. Emergency: 24/7.`
        : `FOR EMERGENCIES: Call ${contactInfo?.emergency_phone || '+255 911'} OR go directly to the Emergency Room. Emergency: 24/7.`;
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('jambo') || input.includes('habari') || input.includes('salam')) {
      return isSwahili
        ? 'Jambo! Karibu hospitali yetu. Ninawezaje kukusaidia leo? Niulize kuhusu idara, huduma, miadi, au mada za elimu ya afya.'
        : "Hello! Welcome to our hospital. How can I help you today? Ask me about departments, services, appointments, or health education topics.";
    }

    if (input.includes('thank') || input.includes('asante') || input.includes('shukran')) {
      return isSwahili
        ? 'Karibu sana! Kuna kitu kingine ninachoweza kukusaidia?'
        : "You're welcome! Is there anything else I can help you with?";
    }

    return t.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowAppointmentForm(false);
    setShowSymptomChecker(false);

    setTimeout(() => {
      const response = generateResponse(userMessage.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 500);
  };

  const handleSymptomSelect = (symptomId: string) => {
    for (const group of symptomGroups) {
      const symptom = group.symptoms.find(s => s.id === symptomId);
      if (symptom) {
        const advice = symptom.advice[lang];
        const deptName = symptom.dept;
        const disclaimer = lang === 'sw'
          ? '\n\n**Onyo**: Hii ni taarifa tu, sio utambuzi wa kitabibu. Tafadhali muone daktari kwa uchunguzi kamili.'
          : '\n\n**Disclaimer**: This is informational only and not a medical diagnosis. Please see a doctor for proper evaluation.';
        const bookPrompt = lang === 'sw'
          ? `\n\nUngependa kupanga miadi na idara ya ${deptName}? Andika "miadi" kuanza.`
          : `\n\nWould you like to book an appointment with the ${deptName} department? Type "appointment" to start.`;
        setMessages(prev => [...prev,
          { id: Date.now().toString(), type: 'user', text: symptom.label[lang], timestamp: new Date() },
          { id: (Date.now() + 1).toString(), type: 'bot', text: advice + disclaimer + bookPrompt, timestamp: new Date() },
        ]);
        setShowSymptomChecker(false);
        setSelectedGroup(null);
        return;
      }
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === t.symptomsChecker) {
      setShowSymptomChecker(true);
      setSelectedGroup(null);
      return;
    }
    const topicId = quickActionToTopicId[action];
    const actionInput = topicId
      ? healthTopics.find(tp => tp.id === topicId)![lang].label
      : action === 'Book Appointment' || action === 'Panga Miadi'
        ? (lang === 'sw' ? 'nataka panga miadi' : 'book appointment')
        : action === 'First Aid' || action === 'Msaada wa Kwanza'
          ? (lang === 'sw' ? 'msaada wa kwanza' : 'first aid')
          : action.toLowerCase();
    setInput(actionInput);
    handleSend();
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('appointments').insert(appointmentData);
    if (!error) {
      const successMsg = lang === 'sw'
        ? 'Miadi yako imetumwa! Tutakupigia simu hapo karibuni kuthibitisha.'
        : 'Your appointment request has been submitted! We will call you shortly to confirm.';
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', text: successMsg, timestamp: new Date() }]);
      setAppointmentData({ patient_name: '', patient_phone: '', patient_email: '', department: '', preferred_date: '', preferred_time: '', message: '' });
      setShowAppointmentForm(false);
    } else {
      const errorMsg = lang === 'sw'
        ? 'Kuna hitilafu. Tafadhali jaribu tena au tupigie simu.'
        : 'There was an error. Please try again or call us directly.';
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', text: errorMsg, timestamp: new Date() }]);
    }
  };

  const quickActionsWithChecker = [...t.quickActions, t.symptomsChecker];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-700 text-white shadow-lg flex items-center justify-center hover:bg-green-800 transition-all ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Health Assistant"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      <div
        className={`fixed z-50 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ bottom: '16px', right: '16px', width: 'calc(100vw - 32px)', maxWidth: '400px', height: 'calc(100vh - 100px)', maxHeight: '600px' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-gray-200">
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <span className="font-semibold">{t.title}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' ? 'bg-green-700 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                }`}>
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

            {showSymptomChecker && (
              <div className="bg-white rounded-xl p-3 border shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                  <Stethoscope className="w-4 h-4" />
                  {t.symptomsChecker}
                </div>
                {!selectedGroup && (
                  <>
                    <p className="text-xs text-gray-500 mb-2">
                      {lang === 'sw' ? 'Chagua eneo la mwili:' : 'Select a body area:'}
                    </p>
                    {symptomGroups.map(g => (
                      <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-green-50 text-sm transition-colors">
                        {g.label[lang]}
                      </button>
                    ))}
                  </>
                )}
                {selectedGroup && (() => {
                  const group = symptomGroups.find(g => g.id === selectedGroup);
                  if (!group) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{group.label[lang]}</span>
                        <button onClick={() => setSelectedGroup(null)} className="text-xs text-green-700 hover:underline">
                          {lang === 'sw' ? 'Rudi' : 'Back'}
                        </button>
                      </div>
                      {group.symptoms.map(s => (
                        <button key={s.id} onClick={() => handleSymptomSelect(s.id)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-green-50 text-sm transition-colors">
                          {s.label[lang]}
                        </button>
                      ))}
                    </>
                  );
                })()}
                <p className="text-xs text-gray-400 mt-2">
                  {lang === 'sw'
                    ? 'Onyo: Hii ni taarifa tu, sio utambuzi wa kitabibu.'
                    : 'Disclaimer: Informational only, not a medical diagnosis.'}
                </p>
              </div>
            )}

            {showAppointmentForm && (
              <form onSubmit={handleAppointmentSubmit} className="bg-white rounded-xl p-3 border shadow-sm space-y-2">
                <input type="text" placeholder={lang === 'sw' ? 'Jina lako *' : 'Your Name *'}
                  value={appointmentData.patient_name} required
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                <input type="tel" placeholder={lang === 'sw' ? 'Nambari ya simu *' : 'Phone Number *'}
                  value={appointmentData.patient_phone} required
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                <input type="email" placeholder={lang === 'sw' ? 'Barua pepe (si lazima)' : 'Email (optional)'}
                  value={appointmentData.patient_email}
                  onChange={(e) => setAppointmentData({ ...appointmentData, patient_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                <select value={appointmentData.department}
                  onChange={(e) => setAppointmentData({ ...appointmentData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent">
                  <option value="">{lang === 'sw' ? 'Chagua Idara' : 'Select Department'}</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  <option value="General">{lang === 'sw' ? 'Mataratibu ya Jumla' : 'General'}</option>
                </select>
                <div className="flex gap-2">
                  <input type="date" value={appointmentData.preferred_date} required
                    onChange={(e) => setAppointmentData({ ...appointmentData, preferred_date: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                  <input type="time" value={appointmentData.preferred_time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, preferred_time: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                </div>
                <textarea placeholder={lang === 'sw' ? 'Ujumbe (si lazima)' : 'Message (optional)'}
                  value={appointmentData.message} rows={2}
                  onChange={(e) => setAppointmentData({ ...appointmentData, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent" />
                <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 text-sm">
                  {lang === 'sw' ? 'Tuma Ombi' : 'Submit Request'}
                </button>
              </form>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-2 py-2 border-t bg-white overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {quickActionsWithChecker.map((action, i) => (
                <button key={i} onClick={() => handleQuickAction(action)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                    action === t.symptomsChecker
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}>
                  {action === t.symptomsChecker ? <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{action}</span> : action}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 border-t bg-white">
            <div className="flex gap-2">
              <input type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
              <button onClick={handleSend}
                className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
