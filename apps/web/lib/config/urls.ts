const LOCAL_API_BASE_URL = 'http://127.0.0.1:4001'
const LOCAL_WS_BASE_URL = 'ws://127.0.0.1:8080'

function firstConfiguredValue(
  ...values: Array<string | undefined>
): string | undefined {
  return values.find((value) => value?.trim())
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function isLocalRuntime(): boolean {
  return process.env.NODE_ENV !== 'production'
}

function isLocalHost(value: string): boolean {
  return (
    value.startsWith('localhost') ||
    value.startsWith('127.0.0.1') ||
    value.startsWith('[::1]')
  )
}

function withProtocol(value: string, protocol: 'http' | 'ws'): string {
  if (/^https?:\/\//.test(value) || /^wss?:\/\//.test(value)) {
    const url = new URL(value)

    if (protocol === 'ws') {
      url.protocol = url.protocol === 'https:' || url.protocol === 'wss:'
        ? 'wss:'
        : 'ws:'
    } else {
      url.protocol = url.protocol === 'wss:' || url.protocol === 'https:'
        ? 'https:'
        : 'http:'
    }

    return url.toString()
  }

  if (isLocalHost(value)) {
    return `${protocol}://${value}`
  }

  return `${protocol === 'ws' ? 'wss' : 'https'}://${value}`
}

function deriveSiblingServiceUrl(
  value: string,
  target: 'api' | 'socket'
): string | null {
  try {
    const url = new URL(withProtocol(value, target === 'socket' ? 'ws' : 'http'))
    const source = target === 'socket' ? 'api' : 'socket'

    if (url.hostname.startsWith(`${source}.`)) {
      url.hostname = url.hostname.replace(`${source}.`, `${target}.`)
    } else if (url.hostname.startsWith(`ephemere-${source}.`)) {
      url.hostname = url.hostname.replace(
        `ephemere-${source}.`,
        `ephemere-${target}.`
      )
    } else {
      return null
    }

    url.protocol = target === 'socket'
      ? url.protocol === 'https:' || url.protocol === 'wss:'
        ? 'wss:'
        : 'ws:'
      : url.protocol === 'wss:' || url.protocol === 'https:'
        ? 'https:'
        : 'http:'

    return normalizeBaseUrl(url.toString())
  } catch {
    return null
  }
}

export function getApiBaseUrl(): string {
  const configured = firstConfiguredValue(
    process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_URL
  )
  if (configured) return normalizeBaseUrl(withProtocol(configured, 'http'))

  const socketUrl = process.env.NEXT_PUBLIC_WS_URL
  const derived = socketUrl ? deriveSiblingServiceUrl(socketUrl, 'api') : null
  if (derived) return derived

  if (isLocalRuntime()) return LOCAL_API_BASE_URL

  throw new Error(
    'NEXT_PUBLIC_SERVER_API_BASE_URL is required in production. Set it to your deployed API Worker URL.'
  )
}

export function getSocketBaseUrl(): string {
  const configured = firstConfiguredValue(
    process.env.NEXT_PUBLIC_WS_URL,
    process.env.NEXT_PUBLIC_SOCKET_URL,
    process.env.NEXT_PUBLIC_WEBSOCKET_URL
  )
  if (configured) return normalizeBaseUrl(withProtocol(configured, 'ws'))

  const apiUrl = firstConfiguredValue(
    process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_URL
  )
  const derived = apiUrl ? deriveSiblingServiceUrl(apiUrl, 'socket') : null
  if (derived) return derived

  if (isLocalRuntime()) return LOCAL_WS_BASE_URL

  throw new Error(
    'NEXT_PUBLIC_WS_URL is required in production. Set it to your deployed Socket Worker URL.'
  )
}

export function getCdnBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_CDN_URL
  if (configured) return normalizeBaseUrl(withProtocol(configured, 'http'))

  return getApiBaseUrl()
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

export function socketUrl(roomId: string): string {
  const url = new URL(getSocketBaseUrl())
  url.searchParams.set('roomId', roomId)
  return url.toString()
}
