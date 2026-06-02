import Razorpay from 'razorpay'

let razorpay: Razorpay | null = null

export function getRazorpayClient(): Razorpay {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Missing required Razorpay environment variables')
    }

    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

  return razorpay
}

export default getRazorpayClient
