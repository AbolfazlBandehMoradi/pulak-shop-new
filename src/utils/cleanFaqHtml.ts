import DOMPurify from 'dompurify';
import he from 'he';

function cleanFaqHtml(html?: string | null): string {
  if (!html) return '';

  const decoded = he.decode(html.trim());

  return DOMPurify.sanitize(decoded, {
    ADD_TAGS: ['iframe', 'video', 'source', 'colgroup', 'col'],

    ADD_ATTR: [
      'style',
      'class',
      'target',
      'rel',
      'colspan',
      'rowspan',
      'width',
      'height',
      'src',
      'href',
      'alt',
      'title',
      'controls',
      'allow',
      'allowfullscreen',
      'frameborder',
      'data-type',
      'data-colwidth',
      'data-align',
    ],

    FORBID_TAGS: ['script', 'object', 'embed'],

    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],

    ALLOW_DATA_ATTR: true,
    ALLOW_ARIA_ATTR: true,
  });
}

export default cleanFaqHtml;
