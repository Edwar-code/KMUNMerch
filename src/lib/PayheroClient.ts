import axios from 'axios';

export class PayheroClient {
  private readonly username: string;
  private readonly password: string;
  private readonly channelId: string;
  private readonly provider: string;
  private readonly baseUrl: string;

  constructor() {
    console.log("NEXT_PUBLIC_PAYHERO_BASE_URL:", process.env.NEXT_PUBLIC_PAYHERO_BASE_URL);
    this.username = process.env.NEXT_PUBLIC_PAYHERO_USERNAME!;
    this.password = process.env.NEXT_PUBLIC_PAYHERO_PASSWORD!;
    this.channelId = process.env.NEXT_PUBLIC_PAYHERO_CHANNEL_ID!;
    this.provider = process.env.NEXT_PUBLIC_PAYHERO_PROVIDER!;
    this.baseUrl = process.env.NEXT_PUBLIC_PAYHERO_BASE_URL!;
  }

  private generateBasicAuthToken(): string {
    const credentials = `${this.username}:${this.password}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    return `Basic ${encodedCredentials}`;
  }

  async createPaymentRequest(amount: number, phoneNumber: string, redirectUrl: string, orderId?: string): Promise<any> {
    const basicAuthToken = this.generateBasicAuthToken();

    try {
      const url = `${this.baseUrl}/payments`;
      console.log("Payment Request URL:", url); 

      const truncatedOrderId = orderId ? orderId.substring(0, 4) : 'Order';

      const response = await axios.post(
        url,
        {
          amount: amount,
          phone_number: phoneNumber,
          redirect_url: redirectUrl,
          channel_id: this.channelId,
          provider: this.provider,
          external_reference: orderId || 'Order',
          description: `Payment for order #${truncatedOrderId}`,
        },
        {
          headers: {
            Authorization: basicAuthToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Payhero payment request error:', error?.response?.data || error.message);
      throw new Error(`Failed to create Payhero payment request: ${error?.response?.data?.message || error.message}`);
    }
  }

  async getPaymentRequestStatus(reference: string): Promise<any> {
    const basicAuthToken = this.generateBasicAuthToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction-status?reference=${reference}`,
        {
          headers: {
            Authorization: basicAuthToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Payhero payment status check error:', error?.response?.data || error.message);
      throw new Error(`Failed to get Payhero payment status: ${error?.response?.data?.message || error.message}`);
    }
  }

  processCallback(body: any) {
    try {
      if (body?.status === 'completed') {
        return {
          success: true,
          data: {
            amount: body.amount,
            phoneNumber: body.customer_phone,
            transactionId: body.transaction_id,
            paymentRequestId: body.id
          },
        };
      } else if (body?.status === 'failed' || body?.status === 'cancelled') {
        return {
          success: false,
          error: body?.message || "Payment Failed."
        };
      } else {
        return {
          success: false,
          error: `Unknown PayHero Callback Status: ${body?.status}`
        }
      }
    } catch (error) {
      console.error('Payhero Callback processing error:', error);
      return {
        success: false,
        error: "Callback processing error",
      };
    }
  }
}