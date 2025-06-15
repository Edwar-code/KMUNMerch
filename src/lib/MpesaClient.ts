import axios from 'axios';

export class MpesaClient {
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly passkey: string;
  private readonly shortcode: string;
  private readonly baseUrl: string;
  private readonly callbackUrl: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.passkey = process.env.MPESA_PASSKEY!;
    this.shortcode = process.env.MPESA_SHORTCODE!;
    this.baseUrl = process.env.MPESA_ENV === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';
    this.callbackUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/mpesa/callback`;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token');
    }
  }

  private generateTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
  }

  private generatePassword(timestamp: string): string {
    return Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`
    ).toString('base64');
  }

  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.toString().replace(/^(?:254|\+254|0)/, '254');
  }

  async initiateSTKPush(phoneNumber: string, amount: number, orderId?: string) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: this.shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: this.callbackUrl,
          AccountReference: orderId || 'Order',
          TransactionDesc: `Payment for order ${orderId || 'Order'}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('STK push error:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  async querySTKStatus(checkoutRequestId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }

   processCallback(body: any) {
    try {
      if (body?.Body?.stkCallback?.ResultCode === 0) {
        const items = body.Body.stkCallback.CallbackMetadata.Item;
        return {
          success: true,
          data: {
            amount: items.find((item: any) => item.Name === 'Amount')?.Value,
            phoneNumber: items.find((item: any) => item.Name === 'PhoneNumber')?.Value,
            transactionId: items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value,
          },
        };
      }
      return {
        success: false,
        error: body?.Body?.stkCallback?.ResultDesc || "Unknown error",
      };
    } catch (error) {
      console.error('Callback processing error:', error);
      return {
        success: false,
        error: "Callback processing error",
      };
    }
  }
}