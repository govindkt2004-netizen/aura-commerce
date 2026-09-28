export const CURRENCY_SYMBOL = '₹';
export const FREE_SHIPPING_THRESHOLD = 4999;
export const STANDARD_SHIPPING_FEE = 199;
export const EXPRESS_SHIPPING_FEE = 499;
export const SHIPPING_FEE = STANDARD_SHIPPING_FEE;

/**
 * Formats a numeric price into Indian Rupees format with the ₹ symbol using Indian locale numbering (lakhs/crores).
 * Example: 32999 -> "₹32,999", 124500 -> "₹1,24,500"
 */
export const formatINR = (amount: number | undefined | null, includeDecimals = false): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  if (includeDecimals && num % 1 !== 0) {
    return (
      '₹' +
      num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

export const formatPrice = formatINR;
