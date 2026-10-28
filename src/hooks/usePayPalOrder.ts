/**
 * SUPER PROJECT EXCALIBUR // 13 AEROSPACE DEFENSE COMPANY
 * PayPal Orders State Machine & Server Status Hook
 * 
 * Authority: US 1 AUTHORITY (PEC 00711617 / SSS 70-186927-77)
 * Path: src/hooks/usePayPalOrder.ts
 * 
 * Manages local order state transitions (PENDING, APPROVED, COMPLETED, FAILED)
 * strictly synchronized with server-side status checks and provider verifications.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  OrderState,
  ExcaliburOrder,
  ExcaliburOrderItem,
  createOrderLifecycle,
  approveOrderLifecycle,
  captureOrderLifecycle,
  failOrderLifecycle,
  validateStateTransition,
  getOrderById,
  getAllOrders,
} from '../../services/paypalSdkService';

export interface ServerStatusCheckResult {
  internalOrderId: string;
  serverState: OrderState;
  synchronized: boolean;
  verifiedProviderResult?: boolean;
  captureId?: string;
  message?: string;
  checkedAt: string;
}

export interface UsePayPalOrderOptions {
  /** Optional initial internal order ID to resume or track */
  initialOrderId?: string;
  /** Optional polling interval in milliseconds to auto-check server status for active orders */
  autoCheckIntervalMs?: number;
  /** Callback fired whenever order status transitions */
  onStateChange?: (newState: OrderState, previousState: OrderState | 'IDLE') => void;
  /** Callback fired on validation or transition rejection error */
  onError?: (errorMessage: string) => void;
}

export interface UsePayPalOrderReturn {
  /** The current active Excalibur order object */
  order: ExcaliburOrder | null;
  /** Current state machine phase */
  status: OrderState | 'IDLE';
  /** Previous state phase */
  previousStatus: OrderState | 'INITIAL' | 'IDLE';
  /** True when local transition or lifecycle action is executing */
  isLoading: boolean;
  /** True when actively polling or performing server status check */
  isCheckingServer: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Complete timestamped transition audit log for current order */
  stateHistory: ExcaliburOrder['stateHistory'];
  /** Latest server-side status verification result */
  lastServerCheck: ServerStatusCheckResult | null;

  // Actions
  /**
   * Creates a new order in PENDING state from server-validated items
   */
  createOrder: (
    items: ExcaliburOrderItem[],
    options?: { customerRef?: string; idempotencyKey?: string }
  ) => Promise<ExcaliburOrder>;

  /**
   * Records buyer authorization in PayPal Sandbox, transitioning from PENDING to APPROVED
   */
  approveOrder: (
    paypalOrderId: string
  ) => Promise<{ success: boolean; order?: ExcaliburOrder; error?: string }>;

  /**
   * Captures approved order and verifies provider payment confirmation before transitioning to COMPLETED
   */
  captureOrder: (providerCaptureData: {
    captureId: string;
    status: string;
    amount?: { value: string; currency_code: string };
  }) => Promise<{ success: boolean; order?: ExcaliburOrder; error?: string }>;

  /**
   * Fails the order with a sanitized diagnostic reason, transitioning to FAILED
   */
  failOrder: (
    reason: string
  ) => { success: boolean; order?: ExcaliburOrder; error?: string };

  /**
   * Explicitly performs an authoritative server-side status check and synchronizes local state
   */
  checkServerStatus: (
    targetOrderId?: string
  ) => Promise<ServerStatusCheckResult>;

  /**
   * Resets local hook state to IDLE
   */
  resetOrder: () => void;

  /**
   * Validates if a target state transition is legally permissible from current state
   */
  canTransitionTo: (
    nextState: OrderState
  ) => { valid: boolean; reason?: string };

  // Status flags
  isPending: boolean;
  isApproved: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isTerminal: boolean;
}

/**
 * React hook to manage local order state transitions (PENDING, APPROVED, COMPLETED, FAILED)
 * with strict fail-closed state machine validation and authoritative server-side checks.
 */
export function usePayPalOrder(options: UsePayPalOrderOptions = {}): UsePayPalOrderReturn {
  const { initialOrderId, autoCheckIntervalMs, onStateChange, onError } = options;

  const [order, setOrder] = useState<ExcaliburOrder | null>(() => {
    if (initialOrderId) {
      return getOrderById(initialOrderId) || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastServerCheck, setLastServerCheck] = useState<ServerStatusCheckResult | null>(null);

  // Keep ref to previous status for transition tracking
  const prevStatusRef = useRef<OrderState | 'IDLE'>(order?.status || 'IDLE');

  const status: OrderState | 'IDLE' = order ? order.status : 'IDLE';

  // Helper to handle and report errors
  const reportError = useCallback(
    (msg: string) => {
      setError(msg);
      if (onError) {
        onError(msg);
      }
    },
    [onError]
  );

  // Helper to check legality of next transition from current status
  const canTransitionTo = useCallback(
    (nextState: OrderState): { valid: boolean; reason?: string } => {
      if (!order) {
        // Can only transition to PENDING from IDLE (order creation)
        if (nextState === 'PENDING') {
          return { valid: true };
        }
        return {
          valid: false,
          reason: `Cannot transition to "${nextState}" when no active order exists. State machine must start at PENDING.`,
        };
      }

      return validateStateTransition(order.status, nextState);
    },
    [order]
  );

  // Lifecycle Action 1: Create Order -> PENDING
  const createOrder = useCallback(
    async (
      items: ExcaliburOrderItem[],
      createOptions?: { customerRef?: string; idempotencyKey?: string }
    ): Promise<ExcaliburOrder> => {
      setIsLoading(true);
      setError(null);
      try {
        const check = canTransitionTo('PENDING');
        if (!check.valid) {
          throw new Error(check.reason);
        }

        const newOrder = createOrderLifecycle(items, createOptions);
        setOrder(newOrder);

        if (onStateChange) {
          onStateChange('PENDING', prevStatusRef.current);
        }
        prevStatusRef.current = 'PENDING';

        return newOrder;
      } catch (err: any) {
        const msg = err?.message || 'Failed to create PayPal order.';
        reportError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [canTransitionTo, onStateChange, reportError]
  );

  // Lifecycle Action 2: Approve Order -> APPROVED
  const approveOrder = useCallback(
    async (
      paypalOrderId: string
    ): Promise<{ success: boolean; order?: ExcaliburOrder; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!order) {
          const msg = 'No active order to approve. Create an order before approving.';
          reportError(msg);
          return { success: false, error: msg };
        }

        const check = canTransitionTo('APPROVED');
        if (!check.valid) {
          reportError(check.reason || 'Invalid transition to APPROVED.');
          return { success: false, error: check.reason };
        }

        const result = approveOrderLifecycle(order.internalOrderId, paypalOrderId);
        if (!result.success || !result.order) {
          reportError(result.error || 'Approval lifecycle failed.');
          return { success: false, error: result.error };
        }

        setOrder({ ...result.order });

        if (onStateChange) {
          onStateChange('APPROVED', prevStatusRef.current);
        }
        prevStatusRef.current = 'APPROVED';

        return { success: true, order: result.order };
      } catch (err: any) {
        const msg = err?.message || 'Exception occurred during order approval.';
        reportError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [order, canTransitionTo, onStateChange, reportError]
  );

  // Lifecycle Action 3: Capture Order -> COMPLETED (Verified provider payment result)
  const captureOrder = useCallback(
    async (providerCaptureData: {
      captureId: string;
      status: string;
      amount?: { value: string; currency_code: string };
    }): Promise<{ success: boolean; order?: ExcaliburOrder; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!order) {
          const msg = 'No active order to capture.';
          reportError(msg);
          return { success: false, error: msg };
        }

        const check = canTransitionTo('COMPLETED');
        if (!check.valid) {
          reportError(check.reason || 'Invalid transition to COMPLETED.');
          return { success: false, error: check.reason };
        }

        const result = await captureOrderLifecycle(order.internalOrderId, providerCaptureData);
        if (!result.success || !result.order) {
          reportError(result.error || 'Capture verification failed.');
          return { success: false, error: result.error };
        }

        setOrder({ ...result.order });

        if (onStateChange) {
          onStateChange('COMPLETED', prevStatusRef.current);
        }
        prevStatusRef.current = 'COMPLETED';

        return { success: true, order: result.order };
      } catch (err: any) {
        const msg = err?.message || 'Exception during order capture verification.';
        reportError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [order, canTransitionTo, onStateChange, reportError]
  );

  // Lifecycle Action 4: Fail Order -> FAILED
  const failOrder = useCallback(
    (reason: string): { success: boolean; order?: ExcaliburOrder; error?: string } => {
      if (!order) {
        const msg = 'No active order to fail.';
        reportError(msg);
        return { success: false, error: msg };
      }

      const check = canTransitionTo('FAILED');
      if (!check.valid) {
        reportError(check.reason || 'Invalid transition to FAILED.');
        return { success: false, error: check.reason };
      }

      const result = failOrderLifecycle(order.internalOrderId, reason);
      if (result.order) {
        setOrder({ ...result.order });
        if (onStateChange) {
          onStateChange('FAILED', prevStatusRef.current);
        }
        prevStatusRef.current = 'FAILED';
      }

      reportError(`[ORDER FAILED]: ${reason}`);
      return result;
    },
    [order, canTransitionTo, onStateChange, reportError]
  );

  // Server-Side Status Check: Synchronizes local order state with authoritative server status
  const checkServerStatus = useCallback(
    async (targetOrderId?: string): Promise<ServerStatusCheckResult> => {
      const orderIdToVerify = targetOrderId || order?.internalOrderId;
      const checkedAt = new Date().toISOString();

      if (!orderIdToVerify) {
        const noOrderResult: ServerStatusCheckResult = {
          internalOrderId: '',
          serverState: 'FAILED',
          synchronized: false,
          message: 'No order ID specified for server-side status verification.',
          checkedAt,
        };
        setLastServerCheck(noOrderResult);
        return noOrderResult;
      }

      setIsCheckingServer(true);
      try {
        // Query authoritative order store (matching GET /api/payments/paypal/orders/{internalOrderId})
        const serverOrder = getOrderById(orderIdToVerify);

        if (!serverOrder) {
          const notFoundResult: ServerStatusCheckResult = {
            internalOrderId: orderIdToVerify,
            serverState: 'FAILED',
            synchronized: false,
            message: `Order ${orderIdToVerify} not found in authoritative server registry.`,
            checkedAt,
          };
          setLastServerCheck(notFoundResult);
          reportError(notFoundResult.message!);
          return notFoundResult;
        }

        // If local order state differs from server state, synchronize legally
        const localStatus = order?.status || 'IDLE';
        if (localStatus !== serverOrder.status) {
          // If moving from IDLE or legally progressing
          if (localStatus === 'IDLE' || validateStateTransition(localStatus, serverOrder.status).valid) {
            setOrder({ ...serverOrder });
            if (onStateChange) {
              onStateChange(serverOrder.status, localStatus);
            }
            prevStatusRef.current = serverOrder.status;
          } else {
            // Illegal server-side desync detected
            const warningMsg = `Server state is "${serverOrder.status}" but local state is "${localStatus}". Transition rejected by state machine.`;
            reportError(warningMsg);
          }
        } else {
          // Ensure order object is up-to-date with any metadata updates
          setOrder({ ...serverOrder });
        }

        const successResult: ServerStatusCheckResult = {
          internalOrderId: serverOrder.internalOrderId,
          serverState: serverOrder.status,
          synchronized: true,
          verifiedProviderResult: serverOrder.captureResult?.verifiedProviderResult,
          captureId: serverOrder.captureResult?.captureId,
          message: `Server status confirmed: ${serverOrder.status}.`,
          checkedAt,
        };

        setLastServerCheck(successResult);
        return successResult;
      } catch (err: any) {
        const errResult: ServerStatusCheckResult = {
          internalOrderId: orderIdToVerify,
          serverState: 'FAILED',
          synchronized: false,
          message: err?.message || 'Server-side status check failed.',
          checkedAt,
        };
        setLastServerCheck(errResult);
        reportError(errResult.message!);
        return errResult;
      } finally {
        setIsCheckingServer(false);
      }
    },
    [order, onStateChange, reportError]
  );

  // Reset Order to IDLE
  const resetOrder = useCallback(() => {
    setOrder(null);
    setError(null);
    setLastServerCheck(null);
    prevStatusRef.current = 'IDLE';
  }, []);

  // Auto-polling server status check if configured
  useEffect(() => {
    if (!autoCheckIntervalMs || !order || autoCheckIntervalMs < 1000) {
      return;
    }

    // Do not poll if order reached terminal state
    if (order.status === 'COMPLETED' || order.status === 'FAILED' || order.status === 'REFUNDED') {
      return;
    }

    const timer = setInterval(() => {
      checkServerStatus(order.internalOrderId);
    }, autoCheckIntervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [autoCheckIntervalMs, order, checkServerStatus]);

  return {
    order,
    status,
    previousStatus: prevStatusRef.current,
    isLoading,
    isCheckingServer,
    error,
    stateHistory: order ? order.stateHistory : [],
    lastServerCheck,

    createOrder,
    approveOrder,
    captureOrder,
    failOrder,
    checkServerStatus,
    resetOrder,
    canTransitionTo,

    isPending: status === 'PENDING',
    isApproved: status === 'APPROVED',
    isCompleted: status === 'COMPLETED',
    isFailed: status === 'FAILED',
    isTerminal: status === 'COMPLETED' || status === 'FAILED' || status === 'REFUNDED',
  };
}

export default usePayPalOrder;
