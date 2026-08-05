type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackCustomer = {
  customer_code: string;
  email: string;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackSubscription = {
  subscription_code: string;
  email_token: string;
  status: string;
  plan: { plan_code: string; name: string };
  customer: { customer_code: string; email: string };
  next_payment_date: string;
  createdAt: string;
};

export type PaystackWebhookEvent = {
  event: string;
  data: Record<string, unknown>;
};

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackClient {
  constructor(private readonly secretKey: string) {}

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as PaystackResponse<T>;

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Paystack request failed');
    }

    return payload.data;
  }

  createCustomer(input: {
    email: string;
    firstName: string;
    metadata: Record<string, string>;
  }) {
    return this.request<PaystackCustomer>('POST', '/customer', {
      email: input.email,
      first_name: input.firstName,
      metadata: input.metadata,
    });
  }

  initializeTransaction(input: {
    email: string;
    planCode: string;
    callbackUrl: string;
    metadata: Record<string, string>;
  }) {
    return this.request<PaystackInitializeData>('POST', '/transaction/initialize', {
      email: input.email,
      plan: input.planCode,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    });
  }

  fetchSubscription(subscriptionCode: string) {
    return this.request<PaystackSubscription>(
      'GET',
      `/subscription/${subscriptionCode}`,
    );
  }

  disableSubscription(subscriptionCode: string, emailToken: string) {
    return this.request<{ status: string }>('POST', '/subscription/disable', {
      code: subscriptionCode,
      token: emailToken,
    });
  }
}
