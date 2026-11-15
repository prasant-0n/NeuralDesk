import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return "--";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatCost(usd?: number): string {
  if (usd === undefined || usd === null) return "$0.0000";
  if (usd < 0.0001 && usd > 0) return "<$0.0001";
  return `$${usd.toFixed(4)}`;
}

export function formatTokens(count?: number): string {
  if (count === undefined || count === null) return "0";
  return new Intl.NumberFormat().format(count);
}
