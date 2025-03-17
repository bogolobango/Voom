import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyType = "FCFA" | "GHS" | "USD";

// Conversion rates (approximate)
const CONVERSION_RATES = {
  "FCFA": 1,
  "GHS": 0.011, // 1 FCFA ≈ 0.011 GHS
  "USD": 0.0017 // 1 FCFA ≈ 0.0017 USD
};

export function convertCurrency(amount: number, fromCurrency: CurrencyType, toCurrency: CurrencyType): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency (FCFA) first if needed
  const amountInFCFA = fromCurrency === "FCFA" 
    ? amount 
    : amount / CONVERSION_RATES[fromCurrency];
    
  // Convert from FCFA to target currency
  return toCurrency === "FCFA"
    ? amountInFCFA
    : amountInFCFA * CONVERSION_RATES[toCurrency];
}

export function formatCurrency(amount: number, currency: CurrencyType = "FCFA"): string {
  let symbol = "";
  let formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  switch (currency) {
    case "USD":
      symbol = "$";
      formatOptions.minimumFractionDigits = 2;
      formatOptions.maximumFractionDigits = 2;
      break;
    case "GHS":
      symbol = "₵";
      formatOptions.minimumFractionDigits = 2;
      formatOptions.maximumFractionDigits = 2;
      break;
    case "FCFA":
    default:
      symbol = "";
      break;
  }
  
  const formattedAmount = amount.toLocaleString(undefined, formatOptions);
  return currency === "FCFA" 
    ? `${formattedAmount} ${currency}`
    : `${symbol}${formattedAmount}`;
}

export function formatDateAndTime(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDaysDifference(startDate: Date | string, endDate: Date | string): number {
  if (typeof startDate === "string") {
    startDate = new Date(startDate);
  }
  
  if (typeof endDate === "string") {
    endDate = new Date(endDate);
  }
  
  const diffInTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffInTime / (1000 * 3600 * 24));
}

export function getHoursDifference(startDate: Date | string, endDate: Date | string): number {
  if (typeof startDate === "string") {
    startDate = new Date(startDate);
  }
  
  if (typeof endDate === "string") {
    endDate = new Date(endDate);
  }
  
  const diffInTime = endDate.getTime() - startDate.getTime();
  return Math.floor((diffInTime % (1000 * 3600 * 24)) / (1000 * 3600));
}

export function formatDuration(startDate: Date | string, endDate: Date | string): string {
  const days = getDaysDifference(startDate, endDate);
  const hours = getHoursDifference(startDate, endDate);
  
  if (days === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
}

export function calculateTotalAmount(dailyRate: number, startDate: Date | string, endDate: Date | string): number {
  const days = getDaysDifference(startDate, endDate);
  const hours = getHoursDifference(startDate, endDate);
  
  // Calculate total amount (daily rate * days + hourly rate * hours)
  const hourlyRate = dailyRate / 24;
  return Math.round(dailyRate * days + hourlyRate * hours);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
