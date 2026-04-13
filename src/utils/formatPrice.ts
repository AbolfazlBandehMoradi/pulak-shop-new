export const formatPrice = (price: number, currency: string = 'تومان'): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ` ${currency}`;
};

export const formatPriceEn = (price: number): string => {
  // Format as USD (assuming 1 USD ≈ 50000 of local currency for demo)
  // Adjust the conversion rate based on your actual currency
  const usdPrice = price / 50000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usdPrice);
};

