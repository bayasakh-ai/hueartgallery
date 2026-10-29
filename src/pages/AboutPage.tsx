import { useState } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { paragraphs } from '@/lib/data';
import { useLanguage } from '@/lib/i18n';
import { PageHeader, SectionTitle, Button } from '@/components/UI';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';
import { useReveal } from '@/hooks/useReveal';
import { MapPin, Mail, Phone, Clock, Instagram, Facebook } from 'lucide-react';

interface AboutPageProps {
  /** slug of a painting the visitor asked about (from "Inquire about this work") */
  inquirePainting?: string;
}

// Netlify Forms: the form is declared in index.html, and this posts to it.
async function sendToNetlify(fields: Record<string, string>) {
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'form-name': 'contact', ...fields }).toString(),
  });
  if (!res.ok) throw new Error('Form submission failed');
}

export default function AboutPage({ inquirePainting }: AboutPageProps) {
  const { gallery, loading, error } = useGallery();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const asked = gallery?.paintings.find((p) => p.slug === inquirePainting);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touchedMessage, setTouchedMessage] = useState(false);
  const { ref, visible } = useReveal<HTMLDivElement>();

  if (loading) return <LoadingScreen />;
  if (error || !gallery) return <ErrorState />;
  const { site } = gallery;

  // Pre-fill the message when arriving from a painting page.
  const message =
    !touchedMessage && !form.message && asked
      ? asked.painter
        ? t('inquiryMessageBy', { title: asked.title, painter: asked.painter.name })
        : t('inquiryMessage', { title: asked.title })
      : form.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !message.trim()) {
      setFormError(t('fillAllFields'));
      return;
    }
    setSubmitting(true);
    try {
      await sendToNetlify({
        name: form.name,
        email: form.email,
        message,
        painting: asked?.title ?? '',
        'bot-field': '',
      });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setTouchedMessage(false);
    } catch {
      setFormError(site.email ? t('sendFailedEmail', { email: site.email }) : t('sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const story = paragraphs(site.about_text);
  const hoursLines = site.hours.split('\n').map((l) => l.trim()).filter(Boolean);
  const addressLines = site.address.split('\n').map((l) => l.trim()).filter(Boolean);
  const hasContactInfo = addressLines.length || site.email || site.phone || hoursLines.length || site.instagram || site.facebook;

  return (
    <div>
      <PageHeader eyebrow={t('ourStory')} title={t('about')} description={site.about_description || site.tagline} />

      {/* Gallery intro + image */}
      {(story.length > 0 || site.about_title) && (
        <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-16">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="image-zoom aspect-[4/3] order-2 md:order-1">
              <img src={site.about_image} alt={site.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="order-1 md:order-2">
              {site.about_title && (
                <h3 className="font-serif-display text-3xl text-ink mb-6 leading-tight">{site.about_title}</h3>
              )}
              {story.map((para, i) => (
                <p key={i} className="text-ink-soft leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission / Vision / Philosophy (any number of blocks, edited in the CMS) */}
      {site.values.length > 0 && (
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} bg-cream-dark/50 py-24`}>
          <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              {site.values.map((v, i) => (
                <div key={i}>
                  {v.label && (
                    <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body">{v.label}</p>
                  )}
                  {v.title && <h3 className="font-serif-display text-2xl text-ink mb-4">{v.title}</h3>}
                  {v.text && <p className="text-ink-soft leading-relaxed text-sm">{v.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visit / Contact info + form */}
      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-24">
        <div className={`grid gap-12 md:gap-20 ${hasContactInfo ? 'md:grid-cols-2' : 'max-w-2xl'}`}>
          {hasContactInfo ? (
            <div>
              <SectionTitle eyebrow={t('visit')} title={t('findUs')} />
              <div className="space-y-6">
                {addressLines.length > 0 && (
                  <div className="flex gap-4">
                    <MapPin size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      {addressLines.map((l, i) => (
                        <p key={i} className="text-ink">{l}</p>
                      ))}
                    </div>
                  </div>
                )}
                {site.email && (
                  <div className="flex gap-4">
                    <Mail size={20} className="text-accent shrink-0 mt-1" />
                    <a href={`mailto:${site.email}`} className="text-ink link-underline">{site.email}</a>
                  </div>
                )}
                {site.phone && (
                  <div className="flex gap-4">
                    <Phone size={20} className="text-accent shrink-0 mt-1" />
                    <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="text-ink">{site.phone}</a>
                  </div>
                )}
                {(hoursLines.length > 0 || site.hours_note) && (
                  <div className="flex gap-4">
                    <Clock size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      {hoursLines.map((l, i) => (
                        <p key={i} className="text-ink">{l}</p>
                      ))}
                      {site.hours_note && <p className="text-ink-soft text-sm">{site.hours_note}</p>}
                    </div>
                  </div>
                )}
                {(site.instagram || site.facebook) && (
                  <div className="flex gap-4 pt-2">
                    {[
                      { Icon: Instagram, href: site.instagram, label: 'Instagram' },
                      { Icon: Facebook, href: site.facebook, label: 'Facebook' },
                    ]
                      .filter((s) => s.href)
                      .map(({ Icon, href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={label}
                          className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink-soft hover:border-accent hover:text-accent transition-all duration-300"
                        >
                          <Icon size={18} />
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Contact form */}
          <div>
            <SectionTitle eyebrow={t('getInTouch')} title={t('contactUs')} />
            {submitted ? (
              <div className="p-8 bg-cream-dark/50 text-center fade-in">
                <p className="font-serif-display text-2xl text-ink mb-2">{t('thankYou')}</p>
                <p className="text-ink-soft text-sm">{t('messageReceived')}</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-accent link-underline">
                  {t('sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="c-name" className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">{t('name')}</label>
                  <input
                    id="c-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-transparent border-b border-line py-3 text-ink focus:outline-none focus:border-accent transition-colors"
                    placeholder={t('yourName')}
                  />
                </div>
                <div>
                  <label htmlFor="c-email" className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">{t('email')}</label>
                  <input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-line py-3 text-ink focus:outline-none focus:border-accent transition-colors"
                    placeholder={t('yourEmail')}
                  />
                </div>
                <div>
                  <label htmlFor="c-message" className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">{t('message')}</label>
                  <textarea
                    id="c-message"
                    value={message}
                    onChange={(e) => {
                      setTouchedMessage(true);
                      setForm({ ...form, message: e.target.value });
                    }}
                    rows={5}
                    className="w-full bg-transparent border-b border-line py-3 text-ink focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder={t('howCanWeHelp')}
                  />
                </div>
                {formError && <p className="text-sm text-red-700">{formError}</p>}
                <div className="pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? t('sending') : t('sendMessage')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
