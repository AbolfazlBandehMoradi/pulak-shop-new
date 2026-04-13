// Helper to get full image URL
export const getImageUrl = (filePath?: string) => {
    if (!filePath) return null;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5299";

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
    }

    return `${apiBaseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

// Helper to format date
export const formatDate = (dateString?: string, langCode: string = "en") => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat(
        langCode === "fa" ? "fa-IR" : langCode === "ar" ? "ar-SA" : "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    ).format(date);
};
