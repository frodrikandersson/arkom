import { api } from '../utils/apiClient';

// ============================================
// STRIPE CONNECT TYPES
// ============================================

export interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  status: 'not_connected' | 'onboarding' | 'active' | 'restricted';
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

export interface OnboardingResponse {
  success: boolean;
  onboardingUrl: string;
  accountId: string;
}

export interface DashboardLinkResponse {
  success: boolean;
  dashboardUrl: string;
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: number;
  orderId: string;
  buyerId: string;
  sellerId: string;
  serviceId: number;
  orderType: 'instant_order' | 'custom_proposal';
  subtotalAmount: number;
  platformFeeAmount: number;
  stripeFeeAmount: number;
  totalAmount: number;
  sellerPayoutAmount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  stripeChargeId: string | null;
  status: 'pending' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'refunded' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  payoutStatus: 'pending' | 'held' | 'released' | 'paid';
  proposalDetails: any | null;
  deliveryNotes: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  conversationId: number | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  platformFee: number;
  sellerPayout: number;
}

// ============================================
// STRIPE CONNECT API
// ============================================

/**
 * Start Stripe Connect onboarding (creates account if needed)
 */
export const startStripeOnboarding = async (): Promise<OnboardingResponse> => {
  const response = await api.post<OnboardingResponse>('/api/stripe/connect/onboard');
  return response;
};

/**
 * Get Stripe Connect account status
 */
export const getStripeConnectStatus = async (): Promise<StripeConnectStatus> => {
  const response = await api.get<{ success: boolean } & StripeConnectStatus>('/api/stripe/connect/status');
  return response;
};

/**
 * Create a new account link (for returning to onboarding)
 */
export const createAccountLink = async (): Promise<{ onboardingUrl: string }> => {
  const response = await api.post<{ success: boolean; onboardingUrl: string }>('/api/stripe/connect/account-link');
  return response;
};

/**
 * Get Stripe dashboard login link
 */
export const getStripeDashboardLink = async (): Promise<DashboardLinkResponse> => {
  const response = await api.post<DashboardLinkResponse>('/api/stripe/connect/dashboard-link');
  return response;
};

// ============================================
// PAYMENT API
// ============================================

/**
 * Create a payment intent for purchasing a service
 */
export const createPaymentIntent = async (
  serviceId: number,
  orderType?: 'instant_order' | 'custom_proposal'
): Promise<PaymentIntentResponse> => {
  const response = await api.post<PaymentIntentResponse>('/api/stripe/payment/create-intent', {
    serviceId,
    orderType,
  });
  return response;
};

// ============================================
// ORDER API
// ============================================

/**
 * Get user's orders
 */
export const getUserOrders = async (role?: 'buyer' | 'seller'): Promise<Order[]> => {
  const url = role ? `/api/stripe/orders?role=${role}` : '/api/stripe/orders';
  const response = await api.get<{ success: boolean; orders: Order[] }>(url);
  return response.orders;
};

/**
 * Get a specific order by ID
 */
export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get<{ success: boolean; order: Order }>(`/api/stripe/orders/${orderId}`);
  return response.order;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format price from cents to display string
 */
export const formatPrice = (cents: number, currency: string = 'EUR'): string => {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

/**
 * Get order status display text
 */
export const getOrderStatusText = (status: Order['status']): string => {
  const statusMap: Record<Order['status'], string> = {
    pending: 'Awaiting Payment',
    paid: 'Paid - Work Can Begin',
    in_progress: 'In Progress',
    delivered: 'Delivered',
    completed: 'Completed',
    disputed: 'Disputed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

/**
 * Get order status color class
 */
export const getOrderStatusColor = (status: Order['status']): string => {
  const colorMap: Record<Order['status'], string> = {
    pending: 'warning',
    paid: 'success',
    in_progress: 'info',
    delivered: 'info',
    completed: 'success',
    disputed: 'error',
    refunded: 'warning',
    cancelled: 'muted',
  };
  return colorMap[status] || 'muted';
};
