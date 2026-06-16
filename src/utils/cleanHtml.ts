import he from "he";

function cleanHtml(htmlString?: string | null) {
  if (!htmlString) return "";

  return he
    .decode(htmlString)
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ");
}

export default cleanHtml;
