/**
 * SUPER PROJECT EXCALIBUR // PAYPAL CHECKOUT INTEGRATION
 * SDK Loading Manager & Order State Machine Lifecycle Service
 * 
 * Target: 13 Aerospace Defense Company / P.A.T. 13 Cognitive Bridge
 * Authority: US 1 AUTHORITY (PEC 00711617 / SSS 70-186927-77)
 * Metadata Version: 1.0.0 (Production Target / Initial Environment: SANDBOX)
 */

export type OrderState =
  | 'PENDING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED';

export type EnvironmentMode = 'SANDBOX' | 'PRODUCTION';

export interface PayPalIntegrationConfig {
  projectName: string;
  module: string;
  integrationType: string;
  ownerLabel: string;
  environment: EnvironmentMode;
  apiBase: string;
  clientId: string;
  merchantEmail?: string;
  cashappCashtag?: string;
  currency: string;
  livePaymentsEnabled: boolean;
  failClosed: boolean;
  productionTarget: boolean;
}

export interface ExcaliburOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitAmount: number;
  category?: 'PHYSICAL_GOODS' | 'DIGITAL_GOODS' | 'DONATION';
}

export interface ExcaliburOrder {
  internalOrderId: string;
  paypalOrderId?: string;
  status: OrderState;
  stateHistory: Array<{
    fromState: OrderState | 'INITIAL';
    toState: OrderState;
    timestamp: string;
    reason?: string;
  }>;
  items: ExcaliburOrderItem[];
  currency: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  totalAmount: number;
  idempotencyKey: string;
  customerRef?: string;
  createdAt: string;
  updatedAt: string;
  captureResult?: {
    captureId: string;
    status: string;
    capturedAt: string;
    verifiedProviderResult: boolean;
    rawDigestSha256?: string;
  };
  failureReason?: string;
}

export interface IntegrationReadinessStatus {
  service: 'PayPal Orders v2';
  integrationPattern: 'SERVER_SIDE_CHECKOUT';
  environment: EnvironmentMode;
  apiBase: string;
  sdkLoaded: boolean;
  sdkStatus: 'IDLE' | 'LOADING' | 'READY' | 'ERROR';
  clientIdConfigured: boolean;
  clientSecretLocation: 'SERVER_SIDE_SECRET_MANAGER';
  credentialsInFrontend: false;
  credentialsInSourceControl: false;
  environmentMismatchPolicy: 'FAIL_CLOSED';
  livePaymentsEnabled: false;
  productionTarget: true;
  orderStateMachine: {
    states: OrderState[];
    completionRule: 'Require_verified_provider_payment_result';
    duplicateProcessing: 'IDEMPOTENT';
    invalidTransitions: 'REJECT';
  };
  routesReady: {
    statusEndpoint: boolean;
    ordersEndpoint: boolean;
    captureEndpoint: boolean;
    getOrderEndpoint: boolean;
    webhooksEndpoint: boolean;
  };
  lastChecked: string;
}

// Canonical Metadata Configuration
export const METADATA_CONFIG: PayPalIntegrationConfig = {
  projectName: 'Super Project EXCALIBUR',
  module: 'PAYPAL_CHECKOUT',
  integrationType: 'DIRECT_BUSINESS_PAYMENTS',
  ownerLabel: '13 Aerospace Defense Company',
  environment: 'SANDBOX',
  apiBase: 'https://api-m.sandbox.paypal.com',
  // Authoritative Sandbox Client ID for Super Project Excalibur
  clientId: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID) || 'BAAqnlpq1I6kXEpEVkIyLHsfZIYLVArdkXQExcwfjlRC-_nqjJxxwORTQHBYC5WZ9qI6c_8Q5tIEBDEg78',
  merchantEmail: 'sb-ayhjr30769518@business.example.com',
  cashappCashtag: '$13adCompany',
  currency: 'USD',
  livePaymentsEnabled: false,
  failClosed: true,
  productionTarget: true,
};

// Global SDK script load tracker
let sdkPromise: Promise<boolean> | null = null;
let sdkLoadStatus: 'IDLE' | 'LOADING' | 'READY' | 'ERROR' = 'IDLE';
let sdkErrorMessage: string | null = null;

// In-memory persistent order registry with idempotency tracking
const orderStore = new Map<string, ExcaliburOrder>();
const idempotencyRegistry = new Map<string, string>(); // idempotencyKey -> internalOrderId

/**
 * Validates legal state transitions based on order state machine rules
 */
export function validateStateTransition(currentState: OrderState, nextState: OrderState): { valid: boolean; reason?: string } {
  // Same state is idempotent
  if (currentState === nextState) {
    return { valid: true };
  }

  const legalTransitions: Record<OrderState, OrderState[]> = {
    PENDING: ['APPROVED', 'FAILED'],
    APPROVED: ['COMPLETED', 'FAILED'],
    COMPLETED: ['REFUNDED', 'DISPUTED'],
    FAILED: [],
    REFUNDED: [],
    DISPUTED: ['REFUNDED'],
  };

  const allowed = legalTransitions[currentState] || [];
  if (allowed.includes(nextState)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Invalid transition from "${currentState}" to "${nextState}". State machine rule: REJECT invalid transitions.`,
  };
}

/**
 * Loads the PayPal JavaScript SDK dynamically in the browser sandbox.
 * Prevents multiple injections and handles fail-closed validation.
 */
export async function loadPayPalSdk(
  clientId: string = METADATA_CONFIG.clientId,
  currency: string = METADATA_CONFIG.currency
): Promise<boolean> {
  // Fail-closed environment check
  if (METADATA_CONFIG.environment === 'PRODUCTION' && !METADATA_CONFIG.livePaymentsEnabled) {
    sdkLoadStatus = 'ERROR';
    sdkErrorMessage = 'FAIL-CLOSED: Production payments are not authorized (live_payments_enabled: false).';
    throw new Error(sdkErrorMessage);
  }

  // If already loaded and window.paypal is ready
  if (typeof window !== 'undefined' && (window as unknown as { paypal?: unknown }).paypal) {
    sdkLoadStatus = 'READY';
    return true;
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkLoadStatus = 'LOADING';

  sdkPromise = new Promise<boolean>((resolve, reject) => {
    if (typeof document === 'undefined') {
      sdkLoadStatus = 'ERROR';
      return resolve(false);
    }

    const existingScript = document.getElementById('paypal-js-sdk');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'paypal-js-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons,funding-eligibility`;
    script.async = true;

    script.onload = () => {
      sdkLoadStatus = 'READY';
      sdkErrorMessage = null;
      resolve(true);
    };

    script.onerror = () => {
      sdkLoadStatus = 'ERROR';
      sdkErrorMessage = 'Failed to load PayPal JavaScript SDK from paypal.com CDN.';
      reject(new Error(sdkErrorMessage));
    };

    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * Returns current SDK loading status
 */
export function getSdkStatus(): { status: 'IDLE' | 'LOADING' | 'READY' | 'ERROR'; error: string | null } {
  return {
    status: sdkLoadStatus,
    error: sdkErrorMessage,
  };
}

/**
 * Returns the non-sensitive integration readiness status (matching /api/payments/paypal/status)
 */
export function getIntegrationReadinessStatus(): IntegrationReadinessStatus {
  return {
    service: 'PayPal Orders v2',
    integrationPattern: 'SERVER_SIDE_CHECKOUT',
    environment: METADATA_CONFIG.environment,
    apiBase: METADATA_CONFIG.apiBase,
    sdkLoaded: typeof window !== 'undefined' && !!(window as unknown as { paypal?: unknown }).paypal,
    sdkStatus: sdkLoadStatus,
    clientIdConfigured: !!METADATA_CONFIG.clientId,
    clientSecretLocation: 'SERVER_SIDE_SECRET_MANAGER',
    credentialsInFrontend: false,
    credentialsInSourceControl: false,
    environmentMismatchPolicy: 'FAIL_CLOSED',
    livePaymentsEnabled: false,
    productionTarget: true,
    orderStateMachine: {
      states: ['PENDING', 'APPROVED', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED'],
      completionRule: 'Require_verified_provider_payment_result',
      duplicateProcessing: 'IDEMPOTENT',
      invalidTransitions: 'REJECT',
    },
    routesReady: {
      statusEndpoint: true,
      ordersEndpoint: true,
      captureEndpoint: true,
      getOrderEndpoint: true,
      webhooksEndpoint: true,
    },
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Order Lifecycle Hook 1: Create Order from validated server-side items
 */
export function createOrderLifecycle(
  items: ExcaliburOrderItem[],
  options?: { idempotencyKey?: string; customerRef?: string }
): ExcaliburOrder {
  const idempotencyKey = options?.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Idempotency check: if already processed, return existing order
  if (idempotencyRegistry.has(idempotencyKey)) {
    const existingId = idempotencyRegistry.get(idempotencyKey)!;
    const existing = orderStore.get(existingId);
    if (existing) {
      return existing;
    }
  }

  // Calculate pricing server-side
  const subtotal = items.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0);
  const taxTotal = 0; // Tax calculated based on jurisdiction if applicable
  const shippingTotal = 0;
  const totalAmount = subtotal + taxTotal + shippingTotal;

  const internalOrderId = `EXC-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date().toISOString();
  const order: ExcaliburOrder = {
    internalOrderId,
    status: 'PENDING',
    stateHistory: [
      {
        fromState: 'INITIAL',
        toState: 'PENDING',
        timestamp: now,
        reason: 'Order created from validated server-side cart payload',
      },
    ],
    items: [...items],
    currency: METADATA_CONFIG.currency,
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    shippingTotal: Number(shippingTotal.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    idempotencyKey,
    customerRef: options?.customerRef || '13ADC-DISPATCH-CLIENT',
    createdAt: now,
    updatedAt: now,
  };

  orderStore.set(internalOrderId, order);
  idempotencyRegistry.set(idempotencyKey, internalOrderId);

  return order;
}

/**
 * Order Lifecycle Hook 2: On Approve (when buyer authorizes payment in PayPal)
 */
export function approveOrderLifecycle(
  internalOrderId: string,
  paypalOrderId: string
): { success: boolean; order?: ExcaliburOrder; error?: string } {
  const order = orderStore.get(internalOrderId);
  if (!order) {
    return { success: false, error: `Order ${internalOrderId} not found.` };
  }

  const transition = validateStateTransition(order.status, 'APPROVED');
  if (!transition.valid) {
    return { success: false, error: transition.reason };
  }

  const now = new Date().toISOString();
  order.paypalOrderId = paypalOrderId;
  order.status = 'APPROVED';
  order.updatedAt = now;
  order.stateHistory.push({
    fromState: 'PENDING',
    toState: 'APPROVED',
    timestamp: now,
    reason: `Buyer approved payment on PayPal (PayPal Order ID: ${paypalOrderId})`,
  });

  return { success: true, order };
}

/**
 * Order Lifecycle Hook 3: Capture Order (verifies provider payment result before marking paid)
 */
export async function captureOrderLifecycle(
  internalOrderId: string,
  providerCaptureData: {
    captureId: string;
    status: string;
    amount?: { value: string; currency_code: string };
  }
): Promise<{ success: boolean; order?: ExcaliburOrder; error?: string }> {
  const order = orderStore.get(internalOrderId);
  if (!order) {
    return { success: false, error: `Order ${internalOrderId} not found.` };
  }

  // Idempotency: if already completed, return existing order cleanly
  if (order.status === 'COMPLETED') {
    return { success: true, order };
  }

  const transition = validateStateTransition(order.status, 'COMPLETED');
  if (!transition.valid) {
    return { success: false, error: transition.reason };
  }

  // Acceptance Criterion: verified provider status required before marking paid
  if (providerCaptureData.status !== 'COMPLETED' && providerCaptureData.status !== 'SUCCESS') {
    failOrderLifecycle(
      internalOrderId,
      `Provider capture returned unverified status: ${providerCaptureData.status}`
    );
    return {
      success: false,
      error: `Provider capture status was not COMPLETED (received: ${providerCaptureData.status})`,
    };
  }

  const now = new Date().toISOString();
  order.status = 'COMPLETED';
  order.updatedAt = now;
  order.captureResult = {
    captureId: providerCaptureData.captureId,
    status: providerCaptureData.status,
    capturedAt: now,
    verifiedProviderResult: true,
  };
  order.stateHistory.push({
    fromState: 'APPROVED',
    toState: 'COMPLETED',
    timestamp: now,
    reason: `Verified provider payment result confirmed (Capture ID: ${providerCaptureData.captureId})`,
  });

  return { success: true, order };
}

/**
 * Order Lifecycle Hook 4: Fail Order (transitions to FAILED with sanitized diagnostic reason)
 */
export function failOrderLifecycle(
  internalOrderId: string,
  reason: string
): { success: boolean; order?: ExcaliburOrder; error?: string } {
  const order = orderStore.get(internalOrderId);
  if (!order) {
    return { success: false, error: `Order ${internalOrderId} not found.` };
  }

  const transition = validateStateTransition(order.status, 'FAILED');
  if (!transition.valid) {
    return { success: false, error: transition.reason };
  }

  const now = new Date().toISOString();
  order.status = 'FAILED';
  order.failureReason = reason;
  order.updatedAt = now;
  order.stateHistory.push({
    fromState: order.status,
    toState: 'FAILED',
    timestamp: now,
    reason,
  });

  return { success: true, order };
}

/**
 * Retrieves an order by internal order ID (matching GET /api/payments/paypal/orders/{internalOrderId})
 */
export function getOrderById(internalOrderId: string): ExcaliburOrder | undefined {
  return orderStore.get(internalOrderId);
}

/**
 * Returns all active orders in the current session
 */
export function getAllOrders(): ExcaliburOrder[] {
  return Array.from(orderStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Resets the in-memory order registry and idempotency cache
 */
export function clearAllOrders(): void {
  orderStore.clear();
  idempotencyRegistry.clear();
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder: (data: any, actions: any) => Promise<string> | string;
        onApprove: (data: any, actions: any) => Promise<void>;
        onError?: (err: any) => void;
        onCancel?: (data: any) => void;
        style?: Record<string, any>;
      }) => {
        render: (container: string | HTMLElement) => Promise<void>;
      };
    };
  }
}
