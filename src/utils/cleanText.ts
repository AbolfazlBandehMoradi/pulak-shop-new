import he from 'he';

export function cleanText(htmlString?: string | null): string {
  if (!htmlString) return '';

  return he
    .decode(htmlString)
    .replace(/<[^>]*>/g, '')
    .replace(/\u00A0/g, ' ') 
    .replace(/\s+/g, ' ') 
    .trim();
}
export default cleanText;
