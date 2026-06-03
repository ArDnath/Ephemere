import { getCdnBaseUrl } from '@/lib/config/urls'

function getPublicUrl(key: string): string {
  const baseUrl = getCdnBaseUrl()

  if (!key) {
    throw new Error('The key parameter is required to generate the URL.')
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedKey = key.startsWith('/') ? key.slice(1) : key

  return `${normalizedBase}${normalizedKey}`
}

export default getPublicUrl
