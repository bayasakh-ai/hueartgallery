import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'mn';

/*
  UI strings in both languages. Add a key here, then read it with
  `const { t } = useLanguage(); t('key')`. Values may contain {placeholders}:
  t('welcomeTo', { name: site.name }).
  (Text edited in the CMS has its own Mongolian fields - see data.ts.)
*/
const strings = {
  // Navigation / footer
  home: { en: 'Home', mn: 'Нүүр' },
  events: { en: 'Exhibition', mn: 'Үзэсгэлэн' },
  painters: { en: 'Artist', mn: 'Уран бүтээлч' },
  paintings: { en: 'Paintings', mn: 'Уран зураг' },
  about: { en: 'About Us', mn: 'Бидний тухай' },
  navigate: { en: 'Navigate', mn: 'Цэс' },
  visit: { en: 'Visit', mn: 'Зочлох' },
  allRights: { en: 'All rights reserved.', mn: 'Бүх эрх хуулиар хамгаалагдсан.' },
  toggleMenu: { en: 'Toggle menu', mn: 'Цэс нээх/хаах' },
  language: { en: 'Language', mn: 'Хэл' },

  // Shared states
  loading: { en: 'Loading', mn: 'Ачаалж байна' },
  errorGeneric: { en: 'Something went wrong. Please try again later.', mn: 'Алдаа гарлаа. Дараа дахин оролдоно уу.' },
  exhibitionNotFound: { en: 'Exhibition not found.', mn: 'Үзэсгэлэн олдсонгүй.' },
  artistNotFound: { en: 'Artist not found.', mn: 'Уран бүтээлч олдсонгүй.' },
  paintingNotFound: { en: 'Painting not found.', mn: 'Уран зураг олдсонгүй.' },
  goToSlide: { en: 'Go to slide {n}', mn: '{n}-р зураг руу очих' },
  slide: { en: 'Slide {n}', mn: 'Зураг {n}' },
  previous: { en: 'Previous', mn: 'Өмнөх' },
  next: { en: 'Next', mn: 'Дараах' },

  // Exhibition timing
  timingUpcoming: { en: 'Upcoming', mn: 'Удахгүй болох' },
  timingCurrent: { en: 'On now', mn: 'Одоо болж буй' },
  timingPast: { en: 'Ended', mn: 'Дууссан' },
  timedExhibition: { en: '{timing} Exhibition', mn: '{timing} үзэсгэлэн' },

  // Painting status / price
  available: { en: 'Available', mn: 'Худалдаанд байгаа' },
  reserved: { en: 'Reserved', mn: 'Захиалгатай' },
  sold: { en: 'Sold', mn: 'Зарагдсан' },
  priceOnRequest: { en: 'Price on request', mn: 'Үнийг лавлана уу' },
  worksAvailableOne: { en: '{n} work available', mn: '{n} бүтээл худалдаанд байна' },
  worksAvailableMany: { en: '{n} works available', mn: '{n} бүтээл худалдаанд байна' },
  worksOne: { en: '{n} work', mn: '{n} бүтээл' },
  worksMany: { en: '{n} works', mn: '{n} бүтээл' },

  // Home
  exhibitionDetails: { en: 'Exhibition Details', mn: 'Дэлгэрэнгүй' },
  viewCollection: { en: 'View Collection', mn: 'Цуглуулга үзэх' },
  exploreArtists: { en: 'Explore Artists', mn: 'Уран бүтээлчидтэй танилцах' },
  welcomeTo: { en: 'Welcome to {name}', mn: '{name}-д тавтай морил' },
  artistsEyebrow: { en: 'Artists', mn: 'Уран бүтээлчид' },
  featuredArtists: { en: 'Featured Artists', mn: 'Онцлох уран бүтээлчид' },
  viewAll: { en: 'View All', mn: 'Бүгдийг үзэх' },
  viewAllArtists: { en: 'View All Artists', mn: 'Бүх уран бүтээлчид' },
  availableNow: { en: 'Available Now', mn: 'Худалдаанд байгаа' },
  selectedPaintings: { en: 'Selected Paintings', mn: 'Сонгосон бүтээлүүд' },
  viewAllPaintings: { en: 'View All Paintings', mn: 'Бүх уран зураг' },

  // Exhibitions
  exhibitionsEyebrow: { en: 'Exhibitions', mn: 'Үзэсгэлэнгүүд' },
  exhibitionsIntro: {
    en: 'Current, upcoming and past exhibitions at {name}.',
    mn: '{name}-ийн одоо болж буй, удахгүй болох болон өнгөрсөн үзэсгэлэнгүүд.',
  },
  exhibition: { en: 'Exhibition', mn: 'Үзэсгэлэн' },
  allExhibitions: { en: 'All Exhibitions', mn: 'Бүх үзэсгэлэн' },
  backToExhibitions: { en: 'Back to Exhibitions', mn: 'Үзэсгэлэн рүү буцах' },
  dates: { en: 'Dates', mn: 'Огноо' },
  location: { en: 'Location', mn: 'Байршил' },
  galleryEyebrow: { en: 'Gallery', mn: 'Галерей' },
  exhibitionViews: { en: 'Exhibition Views', mn: 'Үзэсгэлэнгийн зургууд' },
  film: { en: 'Film', mn: 'Бичлэг' },
  exhibitionVideo: { en: 'Exhibition Video', mn: 'Үзэсгэлэнгийн бичлэг' },
  onView: { en: 'On View', mn: 'Дэлгэгдсэн' },
  selectedArtworks: { en: 'Selected Artworks', mn: 'Сонгосон бүтээлүүд' },

  // Artists
  artistsIntro: { en: 'The artists shown at {name}.', mn: '{name}-д бүтээлээ дэлгэсэн уран бүтээлчид.' },
  allArtists: { en: 'All Artists', mn: 'Бүх уран бүтээлч' },
  backToArtists: { en: 'Back to Artists', mn: 'Уран бүтээлчид рүү буцах' },
  biography: { en: 'Biography', mn: 'Намтар' },
  education: { en: 'Education', mn: 'Боловсрол' },
  artisticStyle: { en: 'Artistic Style', mn: 'Уран бүтээлийн хэв маяг' },
  awards: { en: 'Awards & Recognition', mn: 'Шагнал, өргөмжлөл' },
  artistStatement: { en: 'Artist Statement', mn: 'Уран бүтээлчийн үг' },
  catalogue: { en: 'Catalogue', mn: 'Каталог' },
  galleryOfWorks: { en: 'Gallery of Works', mn: 'Бүтээлүүд' },
  availableForSale: { en: 'Available for Sale', mn: 'Худалдаанд байгаа' },
  currentWorks: { en: 'Current Works', mn: 'Одоогийн бүтээлүүд' },

  // Paintings
  paintingsIntro: {
    en: 'Browse our collection of paintings. Contact the gallery to arrange a viewing or to ask about a work.',
    mn: 'Манай уран зургийн цуглуулгатай танилцана уу. Бүтээлийг биечлэн үзэх эсвэл лавлах бол галерейтай холбогдоорой.',
  },
  allPaintings: { en: 'All Paintings', mn: 'Бүх уран зураг' },
  backToPaintings: { en: 'Back to Paintings', mn: 'Уран зураг руу буцах' },
  year: { en: 'Year', mn: 'Он' },
  medium: { en: 'Medium', mn: 'Материал' },
  dimensions: { en: 'Dimensions', mn: 'Хэмжээ' },
  frame: { en: 'Frame', mn: 'Хүрээ' },
  signature: { en: 'Signature', mn: 'Гарын үсэг' },
  authenticity: { en: 'Authenticity', mn: 'Жинхэнэ эсэх' },
  price: { en: 'Price', mn: 'Үнэ' },
  aboutThisWork: { en: 'About this work', mn: 'Бүтээлийн тухай' },
  inquire: { en: 'Inquire about this work', mn: 'Энэ бүтээлийн талаар лавлах' },
  moreByArtist: { en: 'More by this artist', mn: 'Энэ уран бүтээлчийн бусад бүтээл' },
  relatedWorks: { en: 'Related Works', mn: 'Холбоотой бүтээлүүд' },
  filters: { en: 'Filters', mn: 'Шүүлтүүр' },
  sortNewest: { en: 'Newest first', mn: 'Шинэ нь эхэндээ' },
  sortOldest: { en: 'Oldest first', mn: 'Хуучин нь эхэндээ' },
  sortPriceLow: { en: 'Price: Low to High', mn: 'Үнэ: багаас их рүү' },
  sortPriceHigh: { en: 'Price: High to Low', mn: 'Үнэ: ихээс бага руу' },
  status: { en: 'Status', mn: 'Төлөв' },
  all: { en: 'All', mn: 'Бүгд' },
  allMediums: { en: 'All Mediums', mn: 'Бүх материал' },
  priceRange: { en: 'Price Range', mn: 'Үнийн хязгаар' },
  allPrices: { en: 'All Prices', mn: 'Бүх үнэ' },
  priceUnder2m: { en: 'Under 2,000,000 ₮', mn: '2,000,000 ₮-өөс доош' },
  price2mTo35m: { en: '2,000,000 – 3,500,000 ₮', mn: '2,000,000 – 3,500,000 ₮' },
  priceOver35m: { en: '3,500,000 ₮ and above', mn: '3,500,000 ₮ ба түүнээс дээш' },
  clearFilters: { en: 'Clear filters', mn: 'Шүүлтүүр арилгах' },
  noMatch: { en: 'No paintings match your filters.', mn: 'Шүүлтүүрт тохирох уран зураг олдсонгүй.' },

  // About / contact
  ourStory: { en: 'Our Story', mn: 'Бидний түүх' },
  findUs: { en: 'Find Us', mn: 'Хаяг байршил' },
  getInTouch: { en: 'Get in Touch', mn: 'Холбогдох' },
  contactUs: { en: 'Contact Us', mn: 'Бидэнтэй холбогдох' },
  thankYou: { en: 'Thank you', mn: 'Баярлалаа' },
  messageReceived: {
    en: "Your message has been received. We'll get back to you soon.",
    mn: 'Таны мессежийг хүлээн авлаа. Бид удахгүй хариу өгөх болно.',
  },
  sendAnother: { en: 'Send another message', mn: 'Өөр мессеж илгээх' },
  name: { en: 'Name', mn: 'Нэр' },
  yourName: { en: 'Your name', mn: 'Таны нэр' },
  email: { en: 'Email', mn: 'Имэйл' },
  yourEmail: { en: 'Your email', mn: 'Таны имэйл' },
  message: { en: 'Message', mn: 'Мессеж' },
  howCanWeHelp: { en: 'How can we help?', mn: 'Бид танд юугаар туслах вэ?' },
  fillAllFields: { en: 'Please fill in all fields.', mn: 'Бүх талбарыг бөглөнө үү.' },
  sendFailed: { en: 'Something went wrong. Please try again.', mn: 'Алдаа гарлаа. Дахин оролдоно уу.' },
  sendFailedEmail: {
    en: 'Something went wrong. Please try again or email us at {email}.',
    mn: 'Алдаа гарлаа. Дахин оролдох эсвэл {email} хаягаар имэйл илгээнэ үү.',
  },
  sending: { en: 'Sending...', mn: 'Илгээж байна...' },
  sendMessage: { en: 'Send Message', mn: 'Илгээх' },
  inquiryMessage: { en: 'Hello, I\'m interested in "{title}".', mn: 'Сайн байна уу, "{title}" бүтээлийг сонирхож байна.' },
  inquiryMessageBy: {
    en: 'Hello, I\'m interested in "{title}" by {painter}.',
    mn: 'Сайн байна уу, {painter} зураачийн "{title}" бүтээлийг сонирхож байна.',
  },
} satisfies Record<string, Record<Lang, string>>;

export type StringKey = keyof typeof strings;
type Vars = Record<string, string | number>;

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey, vars?: Vars) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);
const STORAGE_KEY = 'hue-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'mn') return saved;
  } catch {
    // storage blocked - fall back to English
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const t = (key: StringKey, vars?: Vars) => {
    const s: string = strings[key][lang];
    return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
