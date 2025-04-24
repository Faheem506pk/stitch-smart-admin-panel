
/**
 * Currency utility functions
 */

// Get currency symbol from localStorage or default to Rs.
export const getCurrencySymbol = (): string => {
  return localStorage.getItem('currency_symbol') || 'Rs.';
};

// Format a number as currency
export const formatCurrency = (amount: number): string => {
  const symbol = getCurrencySymbol();
  return `${symbol} ${amount.toLocaleString()}`;
};

// Parse a currency string to a number
export const parseCurrency = (currencyString: string): number => {
  const symbol = getCurrencySymbol();
  return parseFloat(currencyString.replace(symbol, '').replace(/,/g, '').trim()) || 0;
};
