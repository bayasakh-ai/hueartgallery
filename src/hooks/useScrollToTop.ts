import { useEffect } from 'react';

export function useScrollToTop(dep: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [dep]);
}
