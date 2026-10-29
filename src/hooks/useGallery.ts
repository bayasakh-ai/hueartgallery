import { useEffect, useState } from 'react';
import { loadGallery } from '@/lib/data';
import { useLanguage } from '@/lib/i18n';
import type { Gallery } from '@/types';

/**
 * Loads the gallery data once; pages just read { gallery, loading, error }.
 * Texts come back in the visitor's chosen language.
 */
export function useGallery() {
  const { lang } = useLanguage();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGallery(lang)
      .then((g) => !cancelled && setGallery(g))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // While switching language the previous one stays on screen (no loading flash).
  return { gallery, loading: !gallery && !error, error };
}
