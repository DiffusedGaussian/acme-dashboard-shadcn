/* ============================================
   ACME Logistics Dashboard — Utilities
   ============================================ */

import type { CallOutcome, CarrierSentiment } from '../types';

// ── Time / Duration Formatting ──

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Currency Formatting ──

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

// ── Percentage Formatting ──

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ── Outcome Helpers ──

export interface OutcomeBadgeConfig {
  className: string;
  label: string;
  icon: string;
}

export const OUTCOME_CONFIG: Record<CallOutcome, OutcomeBadgeConfig> = {
  load_booked: { className: 'badge-success', label: 'Booked', icon: '✓' },
  price_agreed_transfer: { className: 'badge-success', label: 'Agreed → Transfer', icon: '✓' },
  no_agreement: { className: 'badge-warning', label: 'No Agreement', icon: '⚠' },
  carrier_not_interested: { className: 'badge-neutral', label: 'Not Interested', icon: '—' },
  carrier_ineligible: { className: 'badge-danger', label: 'Ineligible', icon: '✕' },
  no_matching_loads: { className: 'badge-neutral', label: 'No Loads', icon: '—' },
  call_dropped: { className: 'badge-danger', label: 'Dropped', icon: '✕' },
  carrier_hung_up: { className: 'badge-warning', label: 'Hung Up', icon: '⚠' },
  max_negotiations_reached: { className: 'badge-warning', label: 'Max Rounds', icon: '⚠' },
};

export function getOutcomeConfig(outcome: CallOutcome): OutcomeBadgeConfig {
  return OUTCOME_CONFIG[outcome] || { className: 'badge-neutral', label: outcome, icon: '?' };
}

// ── Sentiment Helpers ──

export interface SentimentBadgeConfig {
  className: string;
  label: string;
}

export const SENTIMENT_CONFIG: Record<CarrierSentiment, SentimentBadgeConfig> = {
  very_positive: { className: 'badge-success', label: 'Very Positive' },
  positive: { className: 'badge-success', label: 'Positive' },
  eager: { className: 'badge-success', label: 'Eager' },
  neutral: { className: 'badge-neutral', label: 'Neutral' },
  negative: { className: 'badge-warning', label: 'Negative' },
  very_negative: { className: 'badge-danger', label: 'Very Negative' },
  frustrated: { className: 'badge-danger', label: 'Frustrated' },
};

export function getSentimentConfig(sentiment: CarrierSentiment): SentimentBadgeConfig {
  return SENTIMENT_CONFIG[sentiment] || { className: 'badge-neutral', label: sentiment };
}

// ── Chart Colors ──

export const CHART_COLORS = {
  green:  '#00C853',
  orange: '#F05A28',
  slate:  '#94A3B8',
} as const;

// ── Number Formatting ──

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatNumberCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return formatNumber(value);
}

// ── Class Name Helper ──

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ── API URL Helper ──

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}
