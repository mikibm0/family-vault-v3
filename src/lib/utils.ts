import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDataFreshness(updatedAt: string | null | undefined): 'live' | 'today' | 'recent' | 'stale' | 'unknown' {
  if (!updatedAt) return 'unknown';
  const diff = Date.now() - new Date(updatedAt).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 2) return 'live';
  if (hours < 24) return 'today';
  if (hours < 72) return 'recent';
  return 'stale';
}

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}
