/**
 * Currency formatting utilities for Indonesian Rupiah (IDR)
 */

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export const formatNumber = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID').format(numAmount);
};

export const parseCurrency = (currencyString: string): number => {
  // Remove all non-digit characters except decimal point
  const cleanString = currencyString.replace(/[^\d.,]/g, '');
  
  // Handle Indonesian number format (comma as thousand separator, dot as decimal)
  const normalizedString = cleanString.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(normalizedString) || 0;
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};