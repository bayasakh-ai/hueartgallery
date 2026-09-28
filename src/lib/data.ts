import type {
  EventTiming,
  Gallery,
  GalleryEvent,
  Painter,
  Painting,
  PaintingStatus,
  SiteSettings,
} from '@/types';

/*
  Reads the JSON files that the CMS (admin/) edits:
    /data/site.json, /data/painters.json, /data/paintings.json, /data/events.json
  and turns them into linked objects (a painting knows its painter, an
  event knows its painters and paintings). Nothing here talks to a server
  other than fetching those static files.
*/

const FALLBACK_IMAGE = '/images/header.jpeg';

// ---------- small helpers ----------

/** "images/x.jpg" -> "/images/x.jpg"; bare "x.jpg" -> "/images/x.jpg"; URLs untouched. */
export function asset(path?: string | null, fallback = ''): string {
  const p = (path ?? '').trim();
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

/** Text for a painting's price ("2,500,000 ₮", "Price on request", or ""). */
export function priceLabel(p: Pick<Painting, 'price' | 'status'>): string {
  if (p.status !== 'available') return '';
  return p.price > 0 ? formatPrice(p.price) : 'Price on request';
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', opts);
}

export function formatDateRange(start: string, end: string, month: 'short' | 'long' = 'long'): string {
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month, year: 'numeric' };
  const a = formatDate(start, o);
  const b = formatDate(end, o);
  if (a && b && a !== b) return `${a} – ${b}`;
  return a || b;
}

function timingOf(start: string, end: string): EventTiming {
  const today = new Date().toISOString().slice(0, 10);
  if (end && end < today) return 'past';
  if (start && start > today) return 'upcoming';
  return 'current';
}

export const timingLabel: Record<EventTiming, string> = {
  upcoming: 'Upcoming',
  current: 'On now',
  past: 'Ended',
};

/** Splits CMS text into paragraphs (blank line = new paragraph). */
export function paragraphs(s: string): string[] {
  return s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

// ---------- loading ----------

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

function buildSite(raw: Record<string, unknown> | null): SiteSettings {
  const r = raw ?? {};
  const s = { ...DEFAULT_SITE };
  (Object.keys(DEFAULT_SITE) as (keyof SiteSettings)[]).forEach((k) => {
    if (k === 'values') return;
    const v = text(r[k]);
    if (v) (s[k] as string) = v;
  });
  s.home_image = asset(s.home_image, FALLBACK_IMAGE);
  s.about_image = asset(s.about_image, FALLBACK_IMAGE);
  s.values = Array.isArray(r.values)
    ? (r.values as Record<string, unknown>[])
        .map((v) => ({ label: text(v.label), title: text(v.title), text: text(v.text) }))
        .filter((v) => v.title || v.text)
    : [];
  return s;
}

async function build(): Promise<Gallery> {
  const [siteRaw, paintersRaw, paintingsRaw, eventsRaw] = await Promise.all([
    getJson<Record<string, unknown>>('site').catch(() => null),
    getJson<{ painters?: Record<string, unknown>[] }>('painters'),
    getJson<{ paintings?: Record<string, unknown>[] }>('paintings'),
    getJson<{ events?: Record<string, unknown>[] }>('events'),
  ]);

  // Painters
  const painterSlug = uniqueSlugger();
  const painters: Painter[] = (paintersRaw.painters ?? [])
    .filter((p) => text(p.name))
    .map((p) => {
      const slug = painterSlug(text(p.name));
      return {
        id: slug,
        slug,
        name: text(p.name),
        portrait_url: asset(text(p.portrait)), // filled from their paintings below if empty
        bio: text(p.bio),
        statement: text(p.statement),
        style: text(p.style),
        education: text(p.education),
        awards: list(p.awards),
      };
    });
  const painterByName = new Map(painters.map((p) => [p.name, p]));

  // Paintings
  const paintingSlug = uniqueSlugger();
  const paintings: Painting[] = (paintingsRaw.paintings ?? [])
    .filter((p) => text(p.title))
    .map((p) => {
      const slug = paintingSlug(text(p.title));
      const painter = painterByName.get(text(p.painter));
      const status = ['available', 'reserved', 'sold'].includes(text(p.status))
        ? (text(p.status) as PaintingStatus)
        : 'available';
      return {
        id: slug,
        slug,
        painter_id: painter?.id ?? '',
        painter,
        title: text(p.title),
        image_url: asset(text(p.image), FALLBACK_IMAGE),
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
    });
  const paintingByTitle = new Map(paintings.map((p) => [p.title, p]));

  // A painter with no portrait uses one of their paintings instead.
  painters.forEach((pt) => {
    if (!pt.portrait_url) {
      pt.portrait_url = paintings.find((p) => p.painter_id === pt.id)?.image_url ?? FALLBACK_IMAGE;
    }
  });

  // Events
  const eventSlug = uniqueSlugger();
  const events: GalleryEvent[] = (eventsRaw.events ?? [])
    .filter((e) => text(e.title))
    .map((e) => {
      const slug = eventSlug(text(e.title));
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
        painters: list(e.painters).map((n) => painterByName.get(n)).filter((x): x is Painter => !!x),
        paintings: list(e.paintings).map((t) => paintingByTitle.get(t)).filter((x): x is Painting => !!x),
      };
    });

  return { site: buildSite(siteRaw), painters, paintings, events };
}

let cache: Promise<Gallery> | null = null;

/** Loads everything once and reuses it for every page. */
export function loadGallery(): Promise<Gallery> {
  if (!cache) {
    cache = build().catch((err) => {
      cache = null; // allow a retry on the next visit
      throw err;
    });
  }
  return cache;
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
