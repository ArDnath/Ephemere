interface GoogleTokensResult {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  id_token: string
}

export async function getGoogleOAuthTokens(code: string): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token'

  const values = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: 'postmessage',
    grant_type: 'authorization_code',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: values.toString(),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Google OAuth token exchange failed: ${error}`)
  }

  return res.json() as Promise<GoogleTokensResult>
}

