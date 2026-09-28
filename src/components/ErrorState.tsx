import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message = 'Something went wrong. Please try again later.' }: ErrorStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <AlertCircle size={32} className="text-ink-muted" />
        <p className="text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
