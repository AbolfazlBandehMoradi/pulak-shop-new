import he from 'he';

function cleanText(
  htmlString?: string | null,
  keepStyles: boolean = false
) {
  if (!htmlString) return '';

  if (keepStyles) {
    return htmlString.trim();
  }

  const withoutTags = htmlString.replace(/<[^>]+>/g, '');
  return he.decode(withoutTags).trim();
}
export default cleanText;

