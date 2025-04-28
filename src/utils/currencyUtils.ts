
/**
 * Currency utility functions for Pakistani Rupees (Rs)
 */

// Get currency symbol from localStorage or default to Rs
export const getCurrencySymbol = (): string => {
  return localStorage.getItem('currency_symbol') || 'Rs';
};

// Format a number as currency
// Ensures the amount is non-negative and rounded to whole number
export const formatCurrency = (amount: number): string => {
  const symbol = getCurrencySymbol();
  // Ensure amount is non-negative and rounded to whole number
  const validAmount = Math.max(0, Math.round(amount));
  return `${symbol} ${validAmount.toLocaleString()}`;
};

// Parse a currency string to a number
// Returns a non-negative integer
export const parseCurrency = (currencyString: string): number => {
  const symbol = getCurrencySymbol();
  const parsed = parseInt(currencyString.replace(symbol, '').replace(/,/g, '').trim());
  // Ensure the result is a non-negative integer
  return isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed));
};

// Validate a currency input
// Returns true if the input is a valid non-negative integer
export const validateCurrencyInput = (input: string): boolean => {
  // Allow empty string for initial input
  if (input === '') return true;
  
  // Remove commas and check if it's a non-negative integer
  const numericValue = input.replace(/,/g, '');
  return /^\d+$/.test(numericValue);
};
