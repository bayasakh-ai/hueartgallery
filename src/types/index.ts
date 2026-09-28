// Shapes used by the pages. These are built from the JSON files in
// public/data (edited through the CMS) by src/lib/data.ts.

export interface Painter {
  id: string; // same as slug
  slug: string;
  name: string;
  portrait_url: string;
  bio: string;
  statement: string;
  style: string;
  education: string;
  awards: string[];
}

export type PaintingStatus = 'available' | 'reserved' | 'sold';

export interface Painting {
  id: string; // same as slug
  slug: string;
  painter_id: string;
  title: string;
  image_url: string;
  year: number | null;
  medium: string;
  width_cm: number | null;
  height_cm: number | null;
  price: number; // in tugrik; 0 = price on request
  description: string;
  status: PaintingStatus;
  frame: string;
  signature: string;
  authenticity: string;
  painter?: Painter;
}

export type EventTiming = 'upcoming' | 'current' | 'past';

export interface GalleryEvent {
  id: string; // same as slug
  slug: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  cover_url: string;
  video_url: string | null;
  gallery_images: string[];
  timing: EventTiming;
  painters: Painter[];
  paintings: Painting[];
}

export interface SiteValue {
  label: string;
  title: string;
  text: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  footer_text: string;
  home_title: string;
  home_text: string;
  home_image: string;
  about_description: string;
  about_title: string;
  about_text: string;
  about_image: string;
  values: SiteValue[];
  address: string;
  email: string;
  phone: string;
  hours: string;
  hours_note: string;
  instagram: string;
  facebook: string;
}

export interface Gallery {
  site: SiteSettings;
  painters: Painter[];
  paintings: Painting[];
  events: GalleryEvent[];
}

export type Page =
  | 'home'
  | 'events'
  | 'painters'
  | 'paintings'
  | 'about'
  | 'event-detail'
  | 'painter-detail'
  | 'painting-detail';
