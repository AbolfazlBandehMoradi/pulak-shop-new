/**
 * Converts Western Arabic numerals (0-9) to Eastern Arabic/Persian numerals (۰-۹)
 */
export function toPersianNumbers(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  const strValue = String(str);
  return strValue.replace(/\d/g, (digit) => {
    return persianDigits[parseInt(digit, 10)];
  });
}

/**
 * Converts Eastern Arabic/Persian numerals (۰-۹) to Western Arabic numerals (0-9)
 * Also handles Arabic-Indic digits (٠-٩)
 * @param str - The string or number to convert
 * @returns The string with all digits converted to Western Arabic numerals
 */
export const toEnglishNumbers = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicIndicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const strValue = String(str);
  let result = strValue;

  // Convert Persian digits
  persianDigits.forEach((persianDigit, index) => {
    result = result.replace(new RegExp(persianDigit, 'g'), englishDigits[index]);
  });

  // Convert Arabic-Indic digits
  arabicIndicDigits.forEach((arabicDigit, index) => {
    result = result.replace(new RegExp(arabicDigit, 'g'), englishDigits[index]);
  });

  return result;
};

/**
 * Formats a number with locale-specific formatting
 * @param num - The number to format
 * @param locale - The locale code (e.g., 'fa-IR', 'en-US')
 * @param options - Intl.NumberFormat options
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Converts a backend Rial price to a display Toman price.
 */
export function normalizePriceForLanguage(price: number, languageCode: string = 'en'): number {
  void languageCode;
  const safePrice = Number.isFinite(price) ? price : 0;
  return safePrice / 10;
}

/** Localizes digits without changing the surrounding text. */
export function localizeDigits(value: string | number, languageCode: string = 'en'): string {
  const normalized = toEnglishNumbers(value);

  if (languageCode.toLowerCase().startsWith('fa')) {
    return normalized.replace(/\d/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)));
  }

  if (languageCode.toLowerCase().startsWith('ar')) {
    return normalized.replace(/\d/g, (digit) => String.fromCharCode(0x0660 + Number(digit)));
  }

  return normalized;
}

/**
 * Formats a price number only (without currency symbol)
 * @param price - The price to format
 * @param currencySymbol - Ignored for backward compatibility
 * @param languageCode - The language code (e.g., 'fa', 'en')
 * @param putSymbolAfter - Ignored for backward compatibility
 */
export function formatPrice(
  price: number,
  currencySymbol?: string,
  languageCode: string = 'en',
  putSymbolAfter: boolean = false,
): string {
  void currencySymbol;
  void putSymbolAfter;

  const locale = getLocaleForLanguageCode(languageCode);
  const normalizedPrice = normalizePriceForLanguage(price, languageCode);

  // Format the number with locale
  const formattedNumber = formatNumber(normalizedPrice, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formattedNumber;
}

import { getLocaleForLanguageCode } from '@/utils/langRouting';
