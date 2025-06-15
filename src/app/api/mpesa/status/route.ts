import { NextResponse } from 'next/server';
import { MpesaClient } from '@/lib/MpesaClient';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const checkoutRequestId = url.searchParams.get('checkoutRequestId');

  if (!checkoutRequestId) {
    return NextResponse.json(
      { message: 'Checkout request ID is required' },
      { status: 400 }
    );
  }

  try {
    const mpesa = new MpesaClient();
    const response = await mpesa.querySTKStatus(checkoutRequestId);
    console.log('Payment Status Response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}