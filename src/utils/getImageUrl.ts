function getImageUrl(filePath?: string) {
  if (!filePath) return null;

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5299";
  if (/^https?:\/\//.test(filePath)) return filePath;

  return `${baseUrl}${filePath}`;
}

export default getImageUrl;
