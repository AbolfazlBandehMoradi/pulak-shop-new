import { useTranslation as useI18nTranslation } from 'react-i18next'

export function useTranslation() {
  const { t: i18nT } = useI18nTranslation()
  
  const t = (key: string): string => {
    // Use i18next for translations (supports nested keys like 'login.email')
    const result = i18nT(key, { returnObjects: false })
    // If translation not found, i18next returns the key, which is fine
    return typeof result === 'string' ? result : key
  }
  
  return { t }
}

