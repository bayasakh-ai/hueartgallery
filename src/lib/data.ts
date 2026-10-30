import type {
  EventTiming,
  Gallery,
  GalleryEvent,
  Painter,
  Painting,
  PaintingStatus,
  SiteSettings,
} from '@/types';
import type { Lang, StringKey } from '@/lib/i18n';

/*
  Reads the JSON files built from the CMS content (see vite.config.ts):
    /data/site.json, /data/painters.json, /data/paintings.json, /data/events.json
  and turns them into linked objects (a painting knows its painter, an
  event knows its painters and paintings). Nothing here talks to a server
  other than fetching those static files.
*/

const FALLBACK_IMAGE = '/images/header.jpeg';

// ---------- small helpers ----------

/** "images/x.jpg" -> "/images/x.jpg"; bare "x.jpg" -> "/images/x.jpg"; URLs untouched. */
export function asset(path?: string | null, fallback = ''): string {
  // One spelling for accented names (macOS can save "ü" as "u" + accent).
  const p = (path ?? '').trim().normalize('NFC');
  if (!p) return fallback;
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('/') || p.startsWith('data:')) return p;
  return p.includes('/') ? `/${p}` : `/images/${p}`;
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
}

function num(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function list(v: unknown): string[] {
  return Array.isArray(v) ? v.map(text).filter(Boolean) : [];
}

/** Unicode-aware slug so Mongolian (Cyrillic) names still make readable URLs. */
export function slugify(s: string): string {
  const slug = s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/['\u2019]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

function uniqueSlugger() {
  const used = new Set<string>();
  return (base: string) => {
    let slug = slugify(base);
    let i = 2;
    while (used.has(slug)) slug = `${slugify(base)}-${i++}`;
    used.add(slug);
    return slug;
  };
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} ₮`;
}

/** Text for a painting's price ("2,500,000 ₮", the "price on request" text, or ""). */
export function priceLabel(p: Pick<Painting, 'price' | 'status'>, onRequest: string): string {
  if (p.status !== 'available') return '';
  return p.price > 0 ? formatPrice(p.price) : onRequest;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions, lang: Lang = 'en'): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  if (lang === 'mn') {
    // Browsers have no Mongolian month names, so write the date out by hand:
    // long "2026 оны 9-р сарын 29", short "2026.09.29".
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return opts.month === 'long'
      ? `${y} оны ${m}-р сарын ${day}`
      : `${y}.${String(m).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
  }
  return d.toLocaleDateString('en-GB', opts);
}

export function formatDateRange(start: string, end: string, month: 'short' | 'long' = 'long', lang: Lang = 'en'): string {
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month, year: 'numeric' };
  const a = formatDate(start, o, lang);
  const b = formatDate(end, o, lang);
  if (a && b && a !== b) return `${a} – ${b}`;
  return a || b;
}

function timingOf(start: string, end: string): EventTiming {
  const today = new Date().toISOString().slice(0, 10);
  if (end && end < today) return 'past';
  if (start && start > today) return 'upcoming';
  return 'current';
}

/** i18n key for each timing: t(timingKey[event.timing]). */
export const timingKey: Record<EventTiming, StringKey> = {
  upcoming: 'timingUpcoming',
  current: 'timingCurrent',
  past: 'timingPast',
};

/** Splits CMS text into paragraphs (blank line = new paragraph). */
export function paragraphs(s: string): string[] {
  return s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

// ---------- loading ----------

/*
  Every CMS file holds both languages: { "en": {...}, "mn": {...} }.
  Fields that are the same in both (images, prices, dates) are saved under
  the default language only. inLang() gives one flat object for a language,
  using the other language's value wherever this one is empty.
*/
type Raw = Record<string, unknown>;
interface RawItem {
  id?: string;
  en?: Raw;
  mn?: Raw;
}

function isEmpty(v: unknown): boolean {
  return v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
}

function isObject(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function merge(own: Raw, other: Raw): Raw {
  const out: Raw = {};
  new Set([...Object.keys(other), ...Object.keys(own)]).forEach((k) => {
    out[k] =
      isObject(own[k]) && isObject(other[k])
        ? merge(own[k] as Raw, other[k] as Raw)
        : isEmpty(own[k])
          ? other[k]
          : own[k];
  });
  return out;
}

function inLang(item: RawItem | null | undefined, lang: Lang): Raw {
  const out = merge(item?.[lang] ?? {}, item?.[lang === 'en' ? 'mn' : 'en'] ?? {});
  // The CMS keeps optional fields in folded groups ("Size & year", "More details").
  const { size, details, ...rest } = out;
  return { ...(isObject(size) ? size : {}), ...(isObject(details) ? details : {}), ...rest };
}

async function getJson<T>(name: string): Promise<T> {
  const res = await fetch(`/data/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${name}.json`);
  return res.json() as Promise<T>;
}

const DEFAULT_SITE: SiteSettings = {
  name: 'Hue Art Gallery',
  tagline: 'Where Colors Come to Life',
  footer_text: 'Celebrating art, one brushstroke at a time.',
  home_title: 'A space where painting speaks',
  home_text: '',
  home_image: '',
  home_images: [],
  about_description: '',
  about_title: '',
  about_text: '',
  about_image: '',
  values: [],
  address: '',
  email: '',
  phone: '',
  hours: '',
  hours_note: '',
  instagram: '',
  facebook: '',
};

function buildSite(r: Raw): SiteSettings {
  const s = { ...DEFAULT_SITE };
  (Object.keys(DEFAULT_SITE) as (keyof SiteSettings)[]).forEach((k) => {
    if (k === 'values' || k === 'home_images') return;
    const v = text(r[k]);
    if (v) (s[k] as string) = v;
  });
  s.home_image = asset(s.home_image, FALLBACK_IMAGE);
  s.home_images = Array.from(new Set([s.home_image, ...list(r.home_photos).map((x) => asset(x))]));
  s.about_image = asset(s.about_image, FALLBACK_IMAGE);
  s.values = Array.isArray(r.values)
    ? (r.values as Raw[])
        .map((v) => ({ label: text(v.label), title: text(v.title), text: text(v.text) }))
        .filter((v) => v.title || v.text)
    : [];
  return s;
}

interface RawGallery {
  site: RawItem | null;
  painters: RawItem[];
  paintings: RawItem[];
  events: RawItem[];
}

/** An item's address on the site: its CMS file name, or one made from its title. */
function slugger() {
  const next = uniqueSlugger();
  return (item: RawItem, title: string) => next(text(item.id) || title);
}

function build(raw: RawGallery, lang: Lang): Gallery {
  // Painters. Paintings and exhibitions point at a painter by its CMS file
  // name (older data: by name), so remember both.
  const painterSlug = slugger();
  const painterByKey = new Map<string, Painter>();
  const painters: Painter[] = raw.painters
    .map((item) => ({ item, p: inLang(item, lang) }))
    .filter(({ p }) => text(p.name))
    .map(({ item, p }) => {
      const slug = painterSlug(item, text(p.name));
      const painter: Painter = {
        id: slug,
        slug,
        name: text(p.name),
        portrait_url: asset(text(p.photo) || text(p.portrait)), // filled from their paintings below if empty
        bio: text(p.bio),
        statement: text(p.statement),
        style: text(p.style),
        education: text(p.education),
        awards: list(p.awards),
      };
      painterByKey.set(text(item.id), painter);
      painterByKey.set(painter.name, painter);
      return painter;
    });

  // Paintings
  const paintingSlug = slugger();
  const paintingByKey = new Map<string, Painting>();
  const paintings: Painting[] = raw.paintings
    .map((item) => ({ item, p: inLang(item, lang) }))
    .filter(({ p }) => text(p.title))
    .map(({ item, p }) => {
      const slug = paintingSlug(item, text(p.title));
      const painter = painterByKey.get(text(p.painter));
      const image = asset(text(p.image), FALLBACK_IMAGE);
      const status = ['available', 'reserved', 'sold'].includes(text(p.status))
        ? (text(p.status) as PaintingStatus)
        : 'available';
      const painting: Painting = {
        id: slug,
        slug,
        painter_id: painter?.id ?? '',
        painter,
        title: text(p.title),
        image_url: image,
        images: Array.from(new Set([image, ...list(p.photos).map((x) => asset(x))])),
        year: num(p.year),
        medium: text(p.medium),
        width_cm: num(p.width_cm),
        height_cm: num(p.height_cm),
        price: num(p.price) ?? 0,
        description: text(p.description),
        status,
        frame: text(p.frame),
        signature: text(p.signature),
        authenticity: text(p.authenticity),
      };
      paintingByKey.set(text(item.id), painting);
      paintingByKey.set(painting.title, painting);
      return painting;
    });

  // A painter with no portrait uses one of their paintings instead.
  painters.forEach((pt) => {
    if (!pt.portrait_url) {
      pt.portrait_url = paintings.find((p) => p.painter_id === pt.id)?.image_url ?? FALLBACK_IMAGE;
    }
  });

  // Exhibitions
  const eventSlug = slugger();
  const events: GalleryEvent[] = raw.events
    .map((item) => ({ item, e: inLang(item, lang) }))
    .filter(({ e }) => text(e.title))
    .map(({ item, e }) => {
      const slug = eventSlug(item, text(e.title));
      const start = text(e.start_date).slice(0, 10);
      const end = text(e.end_date).slice(0, 10) || start;
      const video = text(e.video);
      return {
        id: slug,
        slug,
        title: text(e.title),
        start_date: start,
        end_date: end,
        location: text(e.location),
        description: text(e.description),
        cover_url: asset(text(e.cover), FALLBACK_IMAGE),
        video_url: video ? asset(video) : null,
        gallery_images: list(e.gallery_images).map((g) => asset(g)),
        timing: timingOf(start, end),
        painters: list(e.painters).map((n) => painterByKey.get(n)).filter((x): x is Painter => !!x),
        paintings: list(e.paintings).map((t) => paintingByKey.get(t)).filter((x): x is Painting => !!x),
      };
    });

  return { site: buildSite(inLang(raw.site, lang)), painters, paintings, events };
}

let rawCache: Promise<RawGallery> | null = null;
const builtCache = new Map<Lang, Promise<Gallery>>();

function loadRaw(): Promise<RawGallery> {
  if (!rawCache) {
    rawCache = Promise.all([
      getJson<RawItem>('site').catch(() => null),
      getJson<{ painters?: RawItem[] }>('painters'),
      getJson<{ paintings?: RawItem[] }>('paintings'),
      getJson<{ events?: RawItem[] }>('events'),
    ])
      .then(([site, painters, paintings, events]) => ({
        site,
        painters: painters.painters ?? [],
        paintings: paintings.paintings ?? [],
        events: events.events ?? [],
      }))
      .catch((err) => {
        rawCache = null; // allow a retry on the next visit
        builtCache.clear();
        throw err;
      });
  }
  return rawCache;
}

/** Loads everything once and reuses it for every page, in the given language. */
export function loadGallery(lang: Lang): Promise<Gallery> {
  let g = builtCache.get(lang);
  if (!g) {
    g = loadRaw().then((raw) => build(raw, lang));
    g.catch(() => builtCache.delete(lang));
    builtCache.set(lang, g);
  }
  return g;
}

/** Upcoming/current first (soonest first), then past events (latest first). */
export function sortEvents(events: GalleryEvent[]): GalleryEvent[] {
  const live = events.filter((e) => e.timing !== 'past').sort((a, b) => a.start_date.localeCompare(b.start_date));
  const past = events.filter((e) => e.timing === 'past').sort((a, b) => b.start_date.localeCompare(a.start_date));
  return [...live, ...past];
}

/** The exhibition to highlight on the home page. */
export function featuredEvent(events: GalleryEvent[]): GalleryEvent | null {
  return sortEvents(events)[0] ?? null;
}
