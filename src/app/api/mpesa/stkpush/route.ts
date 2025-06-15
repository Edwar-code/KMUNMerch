import { NextResponse } from 'next/server';
import { MpesaClient } from '@/lib/MpesaClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, orderId } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { message: 'Phone number and amount are required' },
        { status: 400 }
      );
    }

    const mpesa = new MpesaClient();
    const response = await mpesa.initiateSTKPush(phoneNumber, amount, orderId);
    console.log('STK Push Response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('STK push error:', error);
    return NextResponse.json(
      { message: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}