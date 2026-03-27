/**
 * TraceCore AI — Paystack Payment Integration
 * Handles subscription payments and billing
 */

import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    status: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

/**
 * Initialize a payment transaction
 */
export async function initializePayment(
  email: string,
  amount: number, // in kobo (1 ZAR = 100 kobo)
  metadata: Record<string, any>
): Promise<PaystackInitializeResponse> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Paystack] Initialize payment error:', error);
    throw new Error('Failed to initialize payment');
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Paystack] Verify payment error:', error);
    throw new Error('Failed to verify payment');
  }
}

/**
 * Create a subscription plan
 */
export async function createSubscriptionPlan(
  name: string,
  amount: number, // in kobo
  interval: 'monthly' | 'quarterly' | 'annually'
) {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/plan`,
      {
        name,
        amount,
        interval,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Paystack] Create plan error:', error);
    throw new Error('Failed to create subscription plan');
  }
}

/**
 * Create a subscription for a customer
 */
export async function createSubscription(
  customerCode: string,
  planCode: string
) {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/subscription`,
      {
        customer: customerCode,
        plan: planCode,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Paystack] Create subscription error:', error);
    throw new Error('Failed to create subscription');
  }
}
