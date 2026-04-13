 const getLocalizedText = (lang: string, fa?: string, en?: string) =>
  lang === "fa" ? fa : en;

 export default getLocalizedText