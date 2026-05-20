/**
 * Converts Western Arabic numerals (0-9) to Eastern Arabic/Persian numerals (۰-۹)
 */
export function toPersianNumbers(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  
  const strValue = String(str)
  return strValue.replace(/\d/g, (digit) => {
    return persianDigits[parseInt(digit, 10)]
  })
}

/**
 * Converts Eastern Arabic/Persian numerals (۰-۹) to Western Arabic numerals (0-9)
 * Also handles Arabic-Indic digits (٠-٩)
 * @param str - The string or number to convert
 * @returns The string with all digits converted to Western Arabic numerals
 */
export const toEnglishNumbers = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicIndicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  
  const strValue = String(str)
  let result = strValue
  
  // Convert Persian digits
  persianDigits.forEach((persianDigit, index) => {
    result = result.replace(new RegExp(persianDigit, 'g'), englishDigits[index])
  })
  
  // Convert Arabic-Indic digits
  arabicIndicDigits.forEach((arabicDigit, index) => {
    result = result.replace(new RegExp(arabicDigit, 'g'), englishDigits[index])
  })
  
  return result
}

/**
 * Formats a number with locale-specific formatting
 * @param num - The number to format
 * @param locale - The locale code (e.g., 'fa-IR', 'en-US')
 * @param options - Intl.NumberFormat options
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * Converts a backend price to a display price by language
 * - fa: convert Rial to Toman by dividing by 10
 * - en: keep value as-is
 */
export function normalizePriceForLanguage(
  price: number,
  languageCode: string = 'en'
): number {
  const safePrice = Number.isFinite(price) ? price : 0
  return languageCode === 'fa' ? safePrice / 10 : safePrice
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
  putSymbolAfter: boolean = false
): string {
  void currencySymbol
  void putSymbolAfter

  const isPersian = languageCode === 'fa'
  const locale = isPersian ? 'fa-IR' : 'en-US'
  const normalizedPrice = normalizePriceForLanguage(price, languageCode)
  
  // Format the number with locale
  const formattedNumber = formatNumber(normalizedPrice, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  
  // Convert to Persian numerals if needed
  const finalNumber = isPersian ? toPersianNumbers(formattedNumber) : formattedNumber
  
  return finalNumber
}

