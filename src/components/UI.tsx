import { ArrowLeft } from 'lucide-react';
import type { Page } from '@/types';

interface BackLinkProps {
  label: string;
  onBack: () => void;
}

export function BackLink({ label, onBack }: BackLinkProps) {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors duration-300 link-underline"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({ eyebrow, title, description, align = 'left' }: SectionTitleProps) {
  return (
    <div className={`${align === 'center' ? 'text-center mx-auto max-w-2xl' : ''} mb-12`}>
      {eyebrow && (
        <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif-display text-4xl md:text-5xl text-ink mb-4 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-ink-soft leading-relaxed text-lg max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'outline';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'solid', type = 'button', disabled }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === 'solid'
          ? 'bg-ink text-cream hover:bg-accent'
          : 'border border-ink text-ink hover:bg-ink hover:text-cream'
      }`}
    >
      {children}
    </button>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="pt-32 pb-16 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
      {eyebrow && (
        <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body fade-in">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif-display text-5xl md:text-6xl lg:text-7xl text-ink fade-in-up leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-ink-soft mt-6 max-w-2xl leading-relaxed fade-in-delay-1">
          {description}
        </p>
      )}
    </div>
  );
}

export type { Page };
