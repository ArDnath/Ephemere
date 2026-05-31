import axios from 'axios'
import querystring from 'querystring'
import * as dotenv from 'dotenv'

dotenv.config()

interface GoogleTokensResult {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  id_token: string
}

export async function getGoogleOAuthTokens(
  code: string
): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token'

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: 'postmessage',
    grant_type: 'authorization_code',
  }

  try {
    const res = await axios.post<GoogleTokensResult>(
      url,
      querystring.stringify(values),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    return res.data
  } catch (error: unknown) {
    const err = error as Error
    console.error(err)
    throw new Error(err.message)
  }
}
