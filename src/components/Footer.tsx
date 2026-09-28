import { Instagram, Facebook, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import type { Page } from '@/types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { gallery } = useGallery();
  const site = gallery?.site;
  const address = (site?.address ?? '').split('\n').map((l) => l.trim()).filter(Boolean).join(', ');
  const hours = (site?.hours ?? '').split('\n').map((l) => l.trim()).filter(Boolean).join(' · ');
  const socials = [
    { Icon: Instagram, href: site?.instagram, label: 'Instagram' },
    { Icon: Facebook, href: site?.facebook, label: 'Facebook' },
  ].filter((x) => x.href);

  return (
    <footer className="bg-ink text-cream/70 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-serif-display text-3xl text-cream mb-4">{site?.name ?? 'Hue Art Gallery'}</h3>
            <p className="text-sm leading-relaxed max-w-md text-cream/60">{site?.tagline}</p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-cream/40 mb-4 font-body">
              Navigate
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cream transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-cream transition-colors">
                  Events
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('painters')} className="hover:text-cream transition-colors">
                  Painters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('paintings')} className="hover:text-cream transition-colors">
                  Paintings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cream transition-colors">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-cream/40 mb-4 font-body">
              Visit
            </h4>
            <ul className="space-y-3 text-sm text-cream/60">
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {site?.email && (
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0" />
                  <a href={`mailto:${site.email}`} className="hover:text-cream transition-colors">{site.email}</a>
                </li>
              )}
              {site?.phone && (
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0" />
                  <span>{site.phone}</span>
                </li>
              )}
              {hours && (
                <li className="flex items-start gap-2">
                  <Clock size={16} className="mt-0.5 shrink-0" />
                  <span>{hours}</span>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="flex gap-4 mt-5">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-cream hover:text-cream transition-all duration-300"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} {site?.name ?? 'Hue Art Gallery'}. All rights reserved.</p>
          <p>{site?.footer_text}</p>
        </div>
      </div>
    </footer>
  );
}
