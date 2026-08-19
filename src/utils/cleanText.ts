import he from 'he';
function cleanText(htmlString?: string | null) {
  if (!htmlString) return ""
  const withoutTags = htmlString.replace(/<[^>]+>/g, '');
  return he.decode(withoutTags).trim();
}

export default cleanText