/**
 * Convert text to SEO-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '');
};

/**
 * Build product SEO URL
 */
export const getProductUrl = (title: string): string => {
  const slug = slugify(title);
  return `${window.location.origin}/products/${slug}`;
};

/**
 * Clean current URL (remove encoding)
 */
export const getCleanUrl = (url?: string): string => {
  return decodeURI(url || window.location.href);
};

/**
 * Copy to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};