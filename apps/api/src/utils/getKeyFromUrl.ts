function getKeyFromUrl(url: string): string {
  const baseUrl = process.env.CDN_URL

  if (!baseUrl) {
    throw new Error('CDN_URL is not defined in the environment variables.')
  }

  if (!url) {
    throw new Error('The url parameter is required to extract the key.')
  }

  if (!url.startsWith(baseUrl)) {
    throw new Error(
      'The provided URL does not match the expected CDN base URL.'
    )
  }

  let key = url.replace(baseUrl, '')
  if (key.startsWith('/')) {
    key = key.slice(1)
  }
  return key
}

export default getKeyFromUrl
