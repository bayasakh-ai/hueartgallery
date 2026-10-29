import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <AlertCircle size={32} className="text-ink-muted" />
        <p className="text-ink-soft">{message ?? t('errorGeneric')}</p>
      </div>
    </div>
  );
}
