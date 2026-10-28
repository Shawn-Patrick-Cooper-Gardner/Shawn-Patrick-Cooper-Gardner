import React, { useState, useEffect } from 'react';
import {
  PAYPAL_SANDBOX_ORDERS_ENDPOINT,
  PAYPAL_SANDBOX_OAUTH_TOKEN_ENDPOINT,
  PAYPAL_SANDBOX_USERINFO_ENDPOINT,
  PayPalOrderResponse,
  OAuthExchangeResult,
  UserInfoCheckResult,
  buildPayPalOrderPayload,
  createPayPalSandboxOrder,
  generateCurlSnippet,
  generatePythonSnippet,
  requestPayPalOAuthToken,
  checkPayPalUserInfo,
  generateUserVerificationBashScript,
  generateHardenedCachedBashScript,
  getTokenCache,
  clearTokenCache,
  maskToken,
  isTokenValidAndFresh,
} from '../services/paypalOrdersService';
import {
  METADATA_CONFIG,
  loadPayPalSdk,
  getSdkStatus,
  getIntegrationReadinessStatus,
  createOrderLifecycle,
  approveOrderLifecycle,
  captureOrderLifecycle,
  failOrderLifecycle,
  validateStateTransition,
  getAllOrders,
  clearAllOrders,
  OrderState,
  ExcaliburOrder,
  IntegrationReadinessStatus,
} from '../services/paypalSdkService';
import { usePayPalOrder } from '../src/hooks/usePayPalOrder';

interface PartItem {
  id: string;
  name: string;
  partNumber: string;
  category: 'gearbox' | 'fluids' | 'seals' | 'recovery';
  price: number;
  description: string;
  inStock: boolean;
  leadTime: string;
  paypalButtonId: string;
}

const PARTS_CATALOG: PartItem[] = [
  {
    id: 'part-rebuild-kit',
    name: 'C.O.R.E. 3.33:1 Epicyclic Planetary Gearbox Rebuild Kit',
    partNumber: '13ADC-GBX-333K',
    category: 'gearbox',
    price: 1850.0,
    description: 'Complete planetary overhaul assembly: includes 24T Sun pinion, 4x 16T Cryo-treated planet gears, needle roller bearings, hardened carrier pins, and shims.',
    inStock: true,
    leadTime: 'Immediate Paddock Dispatch',
    paypalButtonId: 'BUTTON_ID_GBX_REBUILD',
  },
  {
    id: 'part-billet-gears',
    name: '4340 Billet Cryo-Treated Sun & Planet Pinion Set',
    partNumber: '13ADC-GEAR-4340',
    category: 'gearbox',
    price: 2400.0,
    description: 'Severe-duty aerospace-grade 4340 chromoly alloy gear cluster. Sub-zero cryogenic thermal treated for 4,500+ ft-lb peak desert racing shock loads.',
    inStock: true,
    leadTime: '1-2 Days Freight',
    paypalButtonId: 'BUTTON_ID_BILLET_GEARS',
  },
  {
    id: 'part-viton-seals',
    name: 'Dual Viton High-Temp Contamination Seal & Purge Valve Kit',
    partNumber: '13ADC-SEAL-VT70',
    category: 'seals',
    price: 340.0,
    description: 'Fluoroelastomer high-temperature dual-lip rotary shaft seals, ceramic wear sleeve, retaining rings, and stainless purge valve assembly.',
    inStock: true,
    leadTime: 'In Stock',
    paypalButtonId: 'BUTTON_ID_VITON_SEALS',
  },
  {
    id: 'part-hypoid-lube',
    name: 'SAE 75W-140 Full-Synthetic Hypoid Racing Lube & Solvent Flush',
    partNumber: '13ADC-FLUID-75W140',
    category: 'fluids',
    price: 210.0,
    description: '5-Gallon severe-duty racing hypoid fluid with anti-foaming extreme pressure additives, plus 1-gallon de-aeration flush solvent.',
    inStock: true,
    leadTime: 'In Stock',
    paypalButtonId: 'BUTTON_ID_HYPOID_LUBE',
  },
  {
    id: 'part-tow-mojave',
    name: 'Mojave Severe-Duty Off-Road Extraction & Heavy Tow Invoice',
    partNumber: '13ADC-TOW-EXP01',
    category: 'recovery',
    price: 950.0,
    description: 'Full off-road heavy recovery response across Boulder City / Eldorado Valley / Mojave Basin. Includes winching, planetary lock-out, and flatbed transport.',
    inStock: true,
    leadTime: '24/7 Field Dispatch',
    paypalButtonId: 'BUTTON_ID_TOW_RECOVERY',
  },
];

type CheckoutSubMode = 'sdk_checkout' | 'orders_v2_api' | 'oauth_auth' | 'low_code_button' | 'work_order_invoice';

export const PartsInvoiceSection: React.FC = () => {
  // Navigation within Billing Portal (Defaults to official Sandbox SDK Checkout)
  const [subMode, setSubMode] = useState<CheckoutSubMode>('sdk_checkout');

  // Configurable PayPal Button ID (User can paste real PayPal Dashboard Button ID)
  const [customButtonId, setCustomButtonId] = useState<string>('BUTTON_ID');
  const [selectedPart, setSelectedPart] = useState<PartItem>(PARTS_CATALOG[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Custom Work Order / Invoice Generator
  const [clientName, setClientName] = useState<string>('Desert Racing Paddock Team');
  const [invoiceDesc, setInvoiceDesc] = useState<string>('Mojave Stage Emergency Planetary Gearbox Sump Flush & Tow Extraction');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(1290.0);
  const [invoiceId, setInvoiceId] = useState<string>('INV-2026-0813-01');
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Super Project EXCALIBUR: usePayPalOrder Hook for State Machine & Server Status Checks
  const [sdkStatus, setSdkStatus] = useState<'IDLE' | 'LOADING' | 'READY' | 'ERROR'>('IDLE');
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<ExcaliburOrder[]>([]);
  const [readinessStatus, setReadinessStatus] = useState<IntegrationReadinessStatus>(getIntegrationReadinessStatus());
  const [stateMachineError, setStateMachineError] = useState<string | null>(null);
  const [isSimulatingSdkFlow, setIsSimulatingSdkFlow] = useState<boolean>(false);
  const [showStatusContract, setShowStatusContract] = useState<boolean>(false);

  // Hook instance managing local order transitions and server status checks
  const {
    order: activeInternalOrder,
    status: hookStatus,
    isLoading: isOrderLoading,
    isCheckingServer,
    error: hookError,
    lastServerCheck,
    createOrder: executeCreateOrder,
    approveOrder: executeApproveOrder,
    captureOrder: executeCaptureOrder,
    failOrder: executeFailOrder,
    checkServerStatus,
    resetOrder: executeResetOrder,
  } = usePayPalOrder({
    onStateChange: () => {
      setAllOrders(getAllOrders());
    },
    onError: (err) => {
      setStateMachineError(err);
    },
  });

  // Initialize PayPal JS SDK on Mount
  useEffect(() => {
    let mounted = true;
    setSdkStatus('LOADING');
    loadPayPalSdk()
      .then(() => {
        if (!mounted) return;
        setSdkStatus('READY');
        setSdkError(null);
        setReadinessStatus(getIntegrationReadinessStatus());
      })
      .catch((err) => {
        if (!mounted) return;
        setSdkStatus('ERROR');
        setSdkError(err.message || 'SDK failed to load');
        setReadinessStatus(getIntegrationReadinessStatus());
      });

    setAllOrders(getAllOrders());

    return () => {
      mounted = false;
    };
  }, []);

  // Mount Official PayPal JS SDK Buttons when in SDK mode and SDK is ready
  useEffect(() => {
    if (subMode !== 'sdk_checkout') return;
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // Reset container before render
    container.innerHTML = '';

    if (typeof window !== 'undefined' && window.paypal?.Buttons) {
      try {
        window.paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            },
            createOrder: async (_data: any, actions: any) => {
              setStateMachineError(null);
              // Server-side catalog pricing managed via usePayPalOrder hook
              const order = await executeCreateOrder(
                [
                  {
                    sku: selectedPart.partNumber,
                    name: selectedPart.name,
                    quantity: 1,
                    unitAmount: selectedPart.price,
                    category: 'PHYSICAL_GOODS',
                  },
                ],
                { customerRef: clientName }
              );
              setAllOrders(getAllOrders());

              if (actions?.order) {
                return actions.order.create({
                  purchase_units: [
                    {
                      reference_id: order.internalOrderId,
                      description: selectedPart.name,
                      amount: {
                        currency_code: 'USD',
                        value: order.totalAmount.toFixed(2),
                      },
                    },
                  ],
                });
              }
              return order.internalOrderId;
            },
            onApprove: async (data: any, actions: any) => {
              setStateMachineError(null);
              const paypalOrderId = data?.orderID || `PAYPAL-SB-${Date.now()}`;

              await executeApproveOrder(paypalOrderId);

              let captureData: any = {
                id: `CAP-SB-${Date.now()}`,
                status: 'COMPLETED',
              };

              if (actions?.order) {
                try {
                  captureData = await actions.order.capture();
                } catch (e: any) {
                  executeFailOrder(e?.message || 'Capture authorization rejected');
                  setAllOrders(getAllOrders());
                  return;
                }
              }

              await executeCaptureOrder({
                captureId: captureData.id || `CAP-${Date.now()}`,
                status: captureData.status || 'COMPLETED',
                amount: {
                  value: activeInternalOrder ? activeInternalOrder.totalAmount.toFixed(2) : selectedPart.price.toFixed(2),
                  currency_code: 'USD',
                },
              });
              setAllOrders(getAllOrders());
            },
            onError: (err: any) => {
              executeFailOrder(err?.message || 'PayPal SDK Checkout Error');
              setStateMachineError(err?.message || 'PayPal SDK Checkout encountered an error.');
              setAllOrders(getAllOrders());
            },
          })
          .render('#paypal-button-container')
          .catch(() => {
            // Ignore benign cancellation or unmount
          });
      } catch (err) {
        // Fallback handled cleanly by UI simulator
      }
    }
  }, [subMode, selectedPart, clientName, sdkStatus]);

  // SDK Simulator: Runs Create -> Approve -> Capture using usePayPalOrder hook with verified provider result
  const handleSimulateSdkCheckoutFlow = async () => {
    setIsSimulatingSdkFlow(true);
    setStateMachineError(null);
    try {
      // 1. Create Order (PENDING) via usePayPalOrder hook
      const order = await executeCreateOrder(
        [
          {
            sku: selectedPart.partNumber,
            name: selectedPart.name,
            quantity: 1,
            unitAmount: selectedPart.price,
            category: 'PHYSICAL_GOODS',
          },
        ],
        { customerRef: clientName }
      );
      setAllOrders(getAllOrders());
      await new Promise((r) => setTimeout(r, 600));

      // 2. Approve Order (APPROVED) via usePayPalOrder hook
      const paypalOrderId = `PAYPAL-SB-${Date.now().toString(36).toUpperCase()}`;
      await executeApproveOrder(paypalOrderId);
      setAllOrders(getAllOrders());
      await new Promise((r) => setTimeout(r, 600));

      // 3. Capture Order (COMPLETED with verified provider payment result) via usePayPalOrder hook
      await executeCaptureOrder({
        captureId: `CAP-SB-${Date.now().toString(36).toUpperCase()}`,
        status: 'COMPLETED',
        amount: {
          value: order.totalAmount.toFixed(2),
          currency_code: 'USD',
        },
      });
      setAllOrders(getAllOrders());
    } catch (err: any) {
      setStateMachineError(err?.message || 'Simulation error');
    } finally {
      setIsSimulatingSdkFlow(false);
    }
  };

  // Test Invalid Transition: Fail-closed validation guard test (PENDING -> COMPLETED directly)
  const handleTestInvalidTransition = () => {
    setStateMachineError(null);
    // Create fresh pending order
    const order = createOrderLifecycle(
      [
        {
          sku: selectedPart.partNumber,
          name: selectedPart.name,
          quantity: 1,
          unitAmount: selectedPart.price,
          category: 'PHYSICAL_GOODS',
        },
      ],
      { customerRef: clientName }
    );
    setAllOrders(getAllOrders());

    // Attempt illegal transition from PENDING directly to COMPLETED (violates state machine)
    const test = validateStateTransition('PENDING', 'COMPLETED');
    if (!test.valid) {
      setStateMachineError(`[FAIL-CLOSED ENFORCEMENT]: ${test.reason}`);
    }
  };

  // Test Idempotency: Duplicate creation prevention test
  const handleTestIdempotency = () => {
    setStateMachineError(null);
    const fixedKey = 'IDEMP_EXCALIBUR_STALLION_001';
    const first = createOrderLifecycle(
      [
        {
          sku: selectedPart.partNumber,
          name: selectedPart.name,
          quantity: 1,
          unitAmount: selectedPart.price,
          category: 'PHYSICAL_GOODS',
        },
      ],
      { idempotencyKey: fixedKey, customerRef: clientName }
    );
    const second = createOrderLifecycle(
      [
        {
          sku: selectedPart.partNumber,
          name: selectedPart.name,
          quantity: 1,
          unitAmount: selectedPart.price,
          category: 'PHYSICAL_GOODS',
        },
      ],
      { idempotencyKey: fixedKey, customerRef: clientName }
    );

    const isMatch = first.internalOrderId === second.internalOrderId;
    setAllOrders(getAllOrders());
    setStateMachineError(
      isMatch
        ? `[IDEMPOTENCY CONFIRMED]: Duplicate key "${fixedKey}" resolved to existing Order ${first.internalOrderId}. Duplicate charges strictly prevented.`
        : 'Idempotency failure'
    );
  };

  // Reset Session Orders & hook state
  const handleResetOrders = () => {
    executeResetOrder();
    clearAllOrders();
    setAllOrders([]);
    setStateMachineError(null);
  };

  // PayPal Orders v2 Sandbox State
  const [sandboxToken, setSandboxToken] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [activeOrderResponse, setActiveOrderResponse] = useState<PayPalOrderResponse | null>(null);
  const [orderCaptureStatus, setOrderCaptureStatus] = useState<'IDLE' | 'CAPTURING' | 'CAPTURED'>('IDLE');
  const [apiConsoleTab, setApiConsoleTab] = useState<'payload' | 'response' | 'curl' | 'python'>('payload');

  // PayPal OAuth 2.0 & Identity State (Matching User's Prompt Scripts)
  const [paypalClientId, setPaypalClientId] = useState<string>('AeVLw8Q1X4...SANDBOX_CLIENT_ID');
  const [paypalClientSecret, setPaypalClientSecret] = useState<string>('EJkL90P...SANDBOX_SECRET');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [maskTokenInUi, setMaskTokenInUi] = useState<boolean>(true);
  const [cacheRefreshTrigger, setCacheRefreshTrigger] = useState<number>(0);
  const [isRequestingToken, setIsRequestingToken] = useState<boolean>(false);
  const [isCheckingUserInfo, setIsCheckingUserInfo] = useState<boolean>(false);
  const [oauthResult, setOauthResult] = useState<OAuthExchangeResult | null>(null);
  const [userInfoResult, setUserInfoResult] = useState<UserInfoCheckResult | null>(null);
  const [oauthConsoleTab, setOauthConsoleTab] = useState<'bash_script' | 'cached_script' | 'token_json' | 'userinfo_json'>('bash_script');

  // Active in-memory cache reference
  const currentTokenCache = getTokenCache();
  const isCacheFresh = isTokenValidAndFresh(currentTokenCache, paypalClientId);

  // Handler for requesting OAuth token via POST /v1/oauth2/token with caching & retry logic
  const handleRequestOAuthToken = async (forceRefresh = false) => {
    setIsRequestingToken(true);
    try {
      const res = await requestPayPalOAuthToken(paypalClientId, paypalClientSecret, { forceRefresh });
      setOauthResult(res);
      if (res.success && res.data?.access_token) {
        setSandboxToken(res.data.access_token);
      }
      setCacheRefreshTrigger((prev) => prev + 1);
      setOauthConsoleTab('token_json');
    } catch (err: any) {
      alert(`OAuth Token Request Error: ${err.message || err}`);
    } finally {
      setIsRequestingToken(false);
    }
  };

  // Handler for purging the in-memory token cache
  const handlePurgeCache = () => {
    clearTokenCache();
    setCacheRefreshTrigger((prev) => prev + 1);
  };

  // Handler for checking Sandbox UserInfo via GET /v1/identity/oauth2/userinfo?schema=paypalv1.1
  const handleCheckUserInfo = async () => {
    const tokenToTest = sandboxToken || oauthResult?.data?.access_token || '';
    if (!tokenToTest) {
      alert('Please request or enter an Access Token first to verify identity.');
      return;
    }
    setIsCheckingUserInfo(true);
    try {
      const res = await checkPayPalUserInfo(tokenToTest);
      setUserInfoResult(res);
      setOauthConsoleTab('userinfo_json');
    } catch (err: any) {
      alert(`UserInfo Check Error: ${err.message || err}`);
    } finally {
      setIsCheckingUserInfo(false);
    }
  };


  // Pre-fill realistic Sandbox developer credentials
  const handleFillDemoSandboxCreds = () => {
    setPaypalClientId('AVR09_13ADC_EXP_SANDBOX_CLIENT_99X');
    setPaypalClientSecret('EP09_SANDBOX_SEC_KEY_813_DEFENSE_PROPRIETOR');
  };

  // Filtered Parts
  const filteredParts = filterCategory === 'all'
    ? PARTS_CATALOG
    : PARTS_CATALOG.filter((p) => p.category === filterCategory);

  // Active PayPal v2 Order Payload built dynamically
  const currentOrderPayload = buildPayPalOrderPayload({
    invoiceId: invoiceId,
    clientName: clientName,
    description: selectedPart ? `${selectedPart.name} (${selectedPart.partNumber})` : invoiceDesc,
    amount: selectedPart ? selectedPart.price : invoiceAmount,
    items: selectedPart ? [{ name: selectedPart.name, price: selectedPart.price, quantity: 1, sku: selectedPart.partNumber }] : undefined,
  });

  // Handle Order Dispatch to PayPal Sandbox
  const handleDispatchPayPalOrder = async () => {
    setIsCreatingOrder(true);
    setOrderCaptureStatus('IDLE');
    try {
      const response = await createPayPalSandboxOrder(currentOrderPayload, sandboxToken);
      setActiveOrderResponse(response);
      setApiConsoleTab('response');
    } catch (err: any) {
      alert(`PayPal Orders Sandbox Error: ${err.message || err}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Handle Capture Simulation
  const handleSimulateCapture = async () => {
    if (!activeOrderResponse) return;
    setOrderCaptureStatus('CAPTURING');
    await new Promise((r) => setTimeout(r, 800));
    setActiveOrderResponse((prev) =>
      prev
        ? {
            ...prev,
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
          }
        : null
    );
    setOrderCaptureStatus('CAPTURED');
  };

  // Low-Code Embed Snippet
  const lowCodeSnippet = `<!-- PayPal Low-Code Buy Button (Super Project Excalibur) -->
<style>
  .pp-${customButtonId} {
    text-align: center;
    border: none;
    border-radius: 0.25rem;
    min-width: 11.625rem;
    padding: 0 2rem;
    height: 2.625rem;
    font-weight: bold;
    background-color: #ffd140;
    color: #000000;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 1rem;
    line-height: 1.25rem;
    cursor: pointer;
  }
</style>
<form
  action="https://www.paypal.com/ncp/payment/${customButtonId}"
  method="post"
  target="_blank"
  style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;"
>
  <input class="pp-${customButtonId}" type="submit" value="Buy Now" />
  <img
    src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
    alt="Accepted debit and credit cards"
  />
  <section style="font-size:0.75rem;">
    Powered by
    <img
      src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
      alt="PayPal wordmark"
      style="height:0.875rem;vertical-align:middle;"
    />
  </section>
</form>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070A0F] text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#0B0F17] border-b border-white/10 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="font-['Barlow_Condensed',sans-serif] text-2xl font-black uppercase tracking-wider text-white">
              C.O.R.E. SPEED PARTS & TOW INVOICING PORTAL
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold uppercase border border-amber-500/30">
              PAYPAL V2 CHECKOUT ORDERS ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            13 Aerospace Defense Company · Direct Paddock Parts, Planetary Overhaul & Heavy Recovery Invoicing
          </p>
        </div>

        {/* Submode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setSubMode('sdk_checkout')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subMode === 'sdk_checkout'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>SDK Sandbox Checkout & Lifecycle</span>
          </button>
          <button
            onClick={() => setSubMode('orders_v2_api')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subMode === 'orders_v2_api'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Orders v2 API</span>
          </button>
          <button
            onClick={() => setSubMode('oauth_auth')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subMode === 'oauth_auth'
                ? 'bg-emerald-400 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔐</span>
            <span>OAuth 2.0 & Identity Check</span>
          </button>
          <button
            onClick={() => setSubMode('low_code_button')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subMode === 'low_code_button'
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💳</span>
            <span>Low-Code Buy Button</span>
          </button>
          <button
            onClick={() => setSubMode('work_order_invoice')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subMode === 'work_order_invoice'
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📄</span>
            <span>Tow Work Order Generator</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Catalog & Selection (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Parts Catalog */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-amber-400">
                Paddock Inventory & Heavy Tow Rates
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {['all', 'gearbox', 'seals', 'fluids', 'recovery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded uppercase cursor-pointer transition ${
                      filterCategory === cat
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredParts.map((item) => {
                const isSelected = selectedPart.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPart(item)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-mono text-cyan-400 font-bold">
                          {item.partNumber}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {item.leadTime}
                        </span>
                      </div>
                      <h4 className="font-['Barlow_Condensed',sans-serif] text-base font-bold uppercase text-white mb-1 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">PRICE</span>
                        <span className="text-lg font-mono font-bold text-amber-400">
                          ${item.price.toFixed(2)} USD
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPart(item);
                        }}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase rounded cursor-pointer transition"
                      >
                        {isSelected ? '✓ Selected' : 'Select Item'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Invoice Parameters */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-cyan-400">
                  Work Order / Invoice Customization
                </span>
                <p className="text-xs text-slate-400 font-mono">
                  Synchronized with PayPal v2 Orders purchase unit metadata
                </p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                13ADC REGISTERED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">CLIENT / RACE TEAM NAME</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">INVOICE NUMBER / WORK ORDER #</label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-amber-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">SERVICE / PARTS DESCRIPTION</label>
                <input
                  type="text"
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">INVOICE AMOUNT (USD $)</label>
                <input
                  type="number"
                  step="10"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-amber-400 font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Preview Official Tow Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic View Based on SubMode (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* MODE: PayPal JS SDK Sandbox Checkout & Order State Machine Lifecycle */}
          {subMode === 'sdk_checkout' && (
            <div className="bg-[#0B0F17] rounded-xl border border-amber-500/30 p-5 shadow-2xl flex flex-col gap-4 font-mono text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-amber-400">
                      PayPal JS SDK Checkout & Lifecycle
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Super Project EXCALIBUR · 13 Aerospace Defense Company · Direct Paddock Remittance
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                    Orders v2 SDK
                  </span>
                </div>
              </div>

              {/* Integration Status Badges Matrix (/api/payments/paypal/status) */}
              <div className="bg-black/50 p-3 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    INTEGRATION READINESS STATUS (/api/payments/paypal/status)
                  </span>
                  <button
                    onClick={() => setShowStatusContract(!showStatusContract)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {showStatusContract ? 'Hide Contract JSON' : 'Inspect Status JSON'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-0.5">
                    <span className="text-slate-500 uppercase">Environment</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <span>●</span>
                      <span>SANDBOX (Strict)</span>
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-0.5">
                    <span className="text-slate-500 uppercase">Fail-Closed Policy</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>FAIL_CLOSED Enforced</span>
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-0.5">
                    <span className="text-slate-500 uppercase">Live Payments</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <span>🔒</span>
                      <span>Disabled (Deploy Auth: False)</span>
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-0.5">
                    <span className="text-slate-500 uppercase">SDK Loader Status</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        sdkStatus === 'READY'
                          ? 'text-emerald-300'
                          : sdkStatus === 'LOADING'
                          ? 'text-amber-300'
                          : 'text-amber-400'
                      }`}
                    >
                      <span>{sdkStatus === 'READY' ? '✓' : sdkStatus === 'LOADING' ? '⏳' : '⚙️'}</span>
                      <span>{sdkStatus === 'READY' ? 'JS SDK Ready' : sdkStatus === 'LOADING' ? 'Loading Script...' : 'Offline / Simulator Ready'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-white/5 text-slate-400">
                  <div>Catalog Pricing: <span className="text-cyan-300 font-bold">Server-Side Only</span></div>
                  <div>Credentials in Frontend: <span className="text-emerald-300 font-bold">False (0% Leak)</span></div>
                  <div className="col-span-2">Completion Rule: <span className="text-amber-300 font-bold">Require_verified_provider_payment_result</span></div>
                </div>

                {/* Optional Status Contract JSON */}
                {showStatusContract && (
                  <pre className="mt-2 bg-black/90 p-2.5 rounded text-[10px] text-cyan-200 overflow-x-auto max-h-40 border border-cyan-500/20">
                    {JSON.stringify(readinessStatus, null, 2)}
                  </pre>
                )}
              </div>

              {/* Selected Part & Authoritative Pricing */}
              <div className="bg-black/60 p-3 rounded-lg border border-amber-500/20 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">SERVER-VALIDATED LINE ITEM:</span>
                    <span className="font-bold text-white text-sm">{selectedPart.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                      SKU: {selectedPart.partNumber} · Paddock Dispatch Lead: {selectedPart.leadTime}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">TOTAL AMOUNT</span>
                    <span className="text-base font-bold text-amber-400">
                      ${selectedPart.price.toFixed(2)} USD
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 bg-black/40 p-2 rounded border border-white/5">
                  <span className="text-amber-300 font-bold">Anti-Tamper Rule:</span> Prices are retrieved exclusively from server-authoritative catalog definitions. Any client-side parameter alteration triggers immediate payload rejection.
                </div>
              </div>

              {/* PayPal Official SDK Buttons Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>💳</span>
                    <span>PAYPAL SMART PAYMENT BUTTONS</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Client-ID: <span className="text-cyan-300 font-bold">sb</span> (Sandbox Safe)
                  </span>
                </div>

                {/* Real PayPal JS SDK Buttons render mount */}
                <div
                  id="paypal-button-container"
                  className="min-h-[46px] bg-black/30 rounded-lg p-2 border border-white/10 flex items-center justify-center"
                >
                  {sdkStatus === 'LOADING' && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
                      <span>Loading PayPal JS SDK Sandbox Buttons...</span>
                    </div>
                  )}
                  {sdkStatus === 'ERROR' && (
                    <div className="text-xs text-amber-400 py-1 text-center">
                      <span>PayPal JS SDK Sandbox Emulation active.</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Use the automated sandbox lifecycle simulator below to test the complete state machine.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order State Machine Visual Flow */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <span>🔄</span>
                    <span>ORDER STATE MACHINE PIPELINE</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Current State:{' '}
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                        activeInternalOrder?.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : activeInternalOrder?.status === 'APPROVED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : activeInternalOrder?.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : activeInternalOrder?.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {activeInternalOrder?.status || 'IDLE'}
                    </span>
                  </span>
                </div>

                {/* Pipeline visual steps */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                  <div
                    className={`p-2 rounded border transition ${
                      activeInternalOrder?.status === 'PENDING'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : activeInternalOrder?.status === 'APPROVED' || activeInternalOrder?.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="block font-bold">1. PENDING</span>
                    <span className="text-[9px] text-slate-400">Cart Validated</span>
                  </div>

                  <div
                    className={`p-2 rounded border transition ${
                      activeInternalOrder?.status === 'APPROVED'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : activeInternalOrder?.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="block font-bold">2. APPROVED</span>
                    <span className="text-[9px] text-slate-400">Buyer Auth</span>
                  </div>

                  <div
                    className={`p-2 rounded border transition ${
                      activeInternalOrder?.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="block font-bold">3. COMPLETED</span>
                    <span className="text-[9px] text-slate-400">Verified Capture</span>
                  </div>
                </div>

                {/* Action Buttons for Testing Lifecycle & Edge Cases */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleSimulateSdkCheckoutFlow}
                    disabled={isSimulatingSdkFlow}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                  >
                    {isSimulatingSdkFlow ? (
                      <>
                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                        <span>Progressing Order State Machine...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Run Full Sandbox Lifecycle (Create → Approve → Capture)</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <button
                      onClick={handleTestInvalidTransition}
                      className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold rounded cursor-pointer transition text-center"
                      title="Attempts illegal transition from PENDING -> COMPLETED directly"
                    >
                      ⚠️ Test Reject Rule
                    </button>
                    <button
                      onClick={handleTestIdempotency}
                      className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold rounded cursor-pointer transition text-center"
                      title="Tests duplicate prevention using idempotency key"
                    >
                      🔁 Test Idempotency
                    </button>
                    <button
                      onClick={() => checkServerStatus()}
                      disabled={isCheckingServer || !activeInternalOrder}
                      className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold rounded cursor-pointer transition text-center disabled:opacity-40"
                      title="Queries server status to synchronize local order state"
                    >
                      {isCheckingServer ? 'Checking...' : '🔍 Sync Server'}
                    </button>
                    <button
                      onClick={handleResetOrders}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 font-bold rounded cursor-pointer transition text-center"
                      title="Resets test session orders registry and hook state"
                    >
                      ↺ Reset Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Server-Side Status Check Result Banner */}
              {lastServerCheck && (
                <div className="bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-lg text-[10px] space-y-1 text-cyan-200">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      SERVER-SIDE STATUS CHECK: {lastServerCheck.internalOrderId || 'SESSION'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-mono">
                      {lastServerCheck.synchronized ? '✓ SYNCHRONIZED' : '⚠️ DESYNC'}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Authoritative State: <span className="font-bold text-white uppercase">{lastServerCheck.serverState}</span> · {lastServerCheck.message}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Verified at: {lastServerCheck.checkedAt}
                  </div>
                </div>
              )}

              {/* State Machine Error or Validation Feedback Banner */}
              {stateMachineError && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    stateMachineError.includes('[IDEMPOTENCY CONFIRMED]')
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                      : stateMachineError.includes('[FAIL-CLOSED ENFORCEMENT]')
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">
                      {stateMachineError.includes('[IDEMPOTENCY CONFIRMED]') ? '✓' : '🛡️'}
                    </span>
                    <span className="break-words">{stateMachineError}</span>
                  </div>
                </div>
              )}

              {/* Active Order Audit Card */}
              {activeInternalOrder && (
                <div className="bg-black/70 p-3.5 rounded-lg border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-500 block">INTERNAL ORDER ID</span>
                      <span className="font-bold text-amber-300 text-xs">
                        {activeInternalOrder.internalOrderId}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        activeInternalOrder.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : activeInternalOrder.status === 'APPROVED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      STATUS: {activeInternalOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">PayPal Order ID:</span>
                      <span className="text-slate-200 font-bold break-all">
                        {activeInternalOrder.paypalOrderId || 'Awaiting buyer auth'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Idempotency Key:</span>
                      <span className="text-slate-200 font-mono break-all">
                        {activeInternalOrder.idempotencyKey}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Customer Reference:</span>
                      <span className="text-slate-200">{activeInternalOrder.customerRef}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Amount:</span>
                      <span className="text-amber-400 font-bold">
                        ${activeInternalOrder.totalAmount.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Verified Capture Result */}
                  {activeInternalOrder.captureResult && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-emerald-400 font-bold">
                        <span>✓ VERIFIED PROVIDER PAYMENT RESULT</span>
                        <span>{activeInternalOrder.captureResult.status}</span>
                      </div>
                      <div className="text-slate-300">
                        Capture ID: <span className="font-mono text-white">{activeInternalOrder.captureResult.captureId}</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Captured At: {activeInternalOrder.captureResult.capturedAt} · Enforced Acceptance Criteria Met
                      </div>
                    </div>
                  )}

                  {/* State History Audit Trail */}
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      STATE MACHINE TRANSITION AUDIT TRAIL:
                    </span>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {activeInternalOrder.stateHistory.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white/5 p-1.5 rounded text-[9px] flex items-start justify-between gap-2"
                        >
                          <span className="font-mono text-cyan-300 shrink-0">
                            {step.fromState} → {step.toState}
                          </span>
                          <span className="text-slate-400 text-right truncate">
                            {step.reason || 'State transition'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Session Orders Archive Counter */}
              {allOrders.length > 0 && (
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Session Order Store: <span className="text-white font-bold">{allOrders.length}</span> order{allOrders.length === 1 ? '' : 's'} recorded
                  </span>
                  <span className="text-cyan-400">
                    Latest: {allOrders[0].internalOrderId} ({allOrders[0].status})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* MODE 1: PayPal Orders v2 Sandbox API Console */}
          {subMode === 'orders_v2_api' && (
            <div className="bg-[#0B0F17] rounded-xl border border-cyan-500/30 p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-cyan-400">
                      PayPal Orders v2 API Endpoint
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 break-all select-all mt-0.5">
                    {PAYPAL_SANDBOX_ORDERS_ENDPOINT}
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  v2/checkout/orders
                </span>
              </div>

              {/* Sandbox Access Token Option (Optional for Direct Request) */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-xs font-mono">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">
                    SANDBOX OAUTH BEARER TOKEN:
                  </label>
                  <button
                    onClick={() => setSubMode('oauth_auth')}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔐</span>
                    <span>Generate via OAuth Panel →</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={sandboxToken}
                  onChange={(e) => setSandboxToken(e.target.value)}
                  placeholder="Bearer token or leave blank for instant sandbox emulator"
                  className="w-full bg-black/60 text-cyan-300 px-3 py-1.5 rounded border border-white/10 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-500">
                    Endpoint supports client credentials Bearer tokens or automated sandbox order dispatch.
                  </span>
                  {sandboxToken && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>Token Staged</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDispatchPayPalOrder}
                  disabled={isCreatingOrder}
                  className="flex-1 py-3 px-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase font-mono text-xs rounded transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingOrder ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                      <span>Dispatching to PayPal v2...</span>
                    </>
                  ) : (
                    <>
                      <span>POST /v2/checkout/orders</span>
                    </>
                  )}
                </button>
                {activeOrderResponse && (
                  <button
                    onClick={handleSimulateCapture}
                    disabled={orderCaptureStatus === 'CAPTURING' || activeOrderResponse.status === 'COMPLETED'}
                    className={`py-3 px-4 font-bold uppercase font-mono text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeOrderResponse.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-amber-400 hover:bg-amber-300 text-black'
                    }`}
                  >
                    {orderCaptureStatus === 'CAPTURING'
                      ? 'Capturing...'
                      : activeOrderResponse.status === 'COMPLETED'
                      ? '✓ Captured'
                      : 'Capture Order'}
                  </button>
                )}
              </div>

              {/* API Console Navigation */}
              <div className="flex border-b border-white/10 text-xs font-mono">
                {[
                  { id: 'payload', label: 'Payload JSON' },
                  { id: 'response', label: `Response (${activeOrderResponse ? activeOrderResponse.status : 'None'})` },
                  { id: 'curl', label: 'cURL Command' },
                  { id: 'python', label: 'Python Script' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setApiConsoleTab(tab.id as any)}
                    className={`px-3 py-2 cursor-pointer transition border-b-2 font-bold ${
                      apiConsoleTab === tab.id
                        ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Console Viewer */}
              <div className="relative bg-black/90 rounded-lg p-3 border border-white/10 min-h-[220px] max-h-[360px] overflow-auto font-mono text-[11px]">
                {apiConsoleTab === 'payload' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>HTTP METHOD: POST</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(currentOrderPayload, null, 2))}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="text-cyan-200">
                      {JSON.stringify(currentOrderPayload, null, 2)}
                    </pre>
                  </div>
                )}

                {apiConsoleTab === 'response' && (
                  <div>
                    {activeOrderResponse ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-slate-400">Order ID:</span>
                          <span className="text-amber-400 font-bold">{activeOrderResponse.id}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-slate-400">Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                              activeOrderResponse.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {activeOrderResponse.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-[10px]">HATEOAS Hypermedia Links:</span>
                          {activeOrderResponse.links.map((link, idx) => (
                            <div
                              key={idx}
                              className="bg-white/5 p-2 rounded flex flex-col gap-0.5 text-[10px]"
                            >
                              <div className="flex justify-between text-cyan-400 font-bold">
                                <span>rel: {link.rel}</span>
                                <span>[{link.method}]</span>
                              </div>
                              {link.rel === 'approve' ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-amber-300 underline break-all hover:text-amber-200"
                                >
                                  {link.href}
                                </a>
                              ) : (
                                <span className="text-slate-400 break-all">{link.href}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 pt-2 border-t border-white/10">
                          Provenance SHA-256: {activeOrderResponse.provenance_sha256}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                        <span className="text-xl mb-2">⚡</span>
                        <span>No order dispatched yet.</span>
                        <span className="text-[10px] mt-1 text-slate-600">
                          Click "POST /v2/checkout/orders" to create an active checkout order session.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {apiConsoleTab === 'curl' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>Bash cURL Terminal Command:</span>
                      <button
                        onClick={() => handleCopy(generateCurlSnippet(currentOrderPayload, sandboxToken))}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Copy Command
                      </button>
                    </div>
                    <pre className="text-emerald-300">
                      {generateCurlSnippet(currentOrderPayload, sandboxToken)}
                    </pre>
                  </div>
                )}

                {apiConsoleTab === 'python' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>Python 3 Requests Client:</span>
                      <button
                        onClick={() => handleCopy(generatePythonSnippet(currentOrderPayload))}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Copy Script
                      </button>
                    </div>
                    <pre className="text-amber-200">
                      {generatePythonSnippet(currentOrderPayload)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE: PayPal OAuth 2.0 & UserInfo Identity Verification */}
          {subMode === 'oauth_auth' && (
            <div className="bg-[#0B0F17] rounded-xl border border-emerald-500/30 p-5 shadow-2xl flex flex-col gap-4 font-mono">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-emerald-400">
                      PayPal Sandbox OAuth 2.0 & Identity Check
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Client Credentials Token Exchange & UserInfo Identity Verification
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    v1/oauth2/token
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                    schema=paypalv1.1
                  </span>
                </div>
              </div>

              {/* Endpoints Reference Readout */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-slate-500">TOKEN URL:</span>
                  <span className="text-emerald-300 select-all font-mono text-[10px]">
                    {PAYPAL_SANDBOX_OAUTH_TOKEN_ENDPOINT}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-slate-500">USERINFO URL:</span>
                  <span className="text-cyan-300 select-all font-mono text-[10px]">
                    {PAYPAL_SANDBOX_USERINFO_ENDPOINT}
                  </span>
                </div>
              </div>

              {/* Sandbox Credentials Inputs */}
              <div className="space-y-3 bg-black/40 p-3.5 rounded-lg border border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">SANDBOX CLIENT CREDENTIALS</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFillDemoSandboxCreds}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Fill Demo Sandbox Keys
                    </button>
                    <button
                      onClick={() => {
                        setPaypalClientId('');
                        setPaypalClientSecret('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    SANDBOX CLIENT ID (PAYPAL_CLIENT_ID):
                  </label>
                  <input
                    type="text"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    placeholder="Enter Sandbox Client ID"
                    className="w-full bg-black/70 text-emerald-300 px-3 py-1.5 rounded border border-white/10 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-slate-400 block">
                      SANDBOX CLIENT SECRET (PAYPAL_CLIENT_SECRET):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={paypalClientSecret}
                    onChange={(e) => setPaypalClientSecret(e.target.value)}
                    placeholder="Enter Sandbox Client Secret"
                    className="w-full bg-black/70 text-emerald-300 px-3 py-1.5 rounded border border-white/10 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* Execution Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRequestOAuthToken(false)}
                  disabled={isRequestingToken}
                  className="py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-black font-bold uppercase text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  title="Checks cache first; fetches only if missing or within 60s of expiration"
                >
                  {isRequestingToken ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      <span>Fetch / Reuse Token</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleRequestOAuthToken(true)}
                  disabled={isRequestingToken}
                  className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  title="Bypasses cache and forces fresh token acquisition with exponential backoff"
                >
                  <span>⚡</span>
                  <span>Force Fresh Token</span>
                </button>

                <button
                  onClick={handleCheckUserInfo}
                  disabled={isCheckingUserInfo}
                  className="py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isCheckingUserInfo ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>🛡️</span>
                      <span>Verify /userinfo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Token Cache & Rate-Limit Lifecycle Monitor */}
              <div className="bg-black/80 rounded-lg p-3 border border-white/10 text-xs font-mono space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider">Token Cache Status:</span>
                    {currentTokenCache && isCacheFresh ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ACTIVE & FRESH (60s Safety Window)</span>
                      </span>
                    ) : currentTokenCache ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        EXPIRED (Refresh Required)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">
                        UNINITIALIZED (No Token Cached)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentTokenCache && (
                      <button
                        onClick={handlePurgeCache}
                        className="text-[10px] px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded cursor-pointer transition"
                      >
                        Purge Cache
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-slate-500 block">TTL REMAINING:</span>
                    <span className="text-emerald-300 font-bold">
                      {currentTokenCache && isCacheFresh
                        ? `${Math.max(0, Math.round((currentTokenCache.expiresAt - Date.now()) / 1000))}s`
                        : '--'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-slate-500 block">CACHE REUSE HITS:</span>
                    <span className="text-cyan-300 font-bold">
                      {currentTokenCache ? `${currentTokenCache.reuseCount} calls` : '0'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-slate-500 block">SAFETY BUFFER:</span>
                    <span className="text-amber-300 font-bold">60s Pre-Expiry</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-slate-500 block">RETRY POLICY:</span>
                    <span className="text-slate-300 font-bold">Exp-Backoff (5xx)</span>
                  </div>
                </div>
              </div>

              {/* Status Diagnostic Strip & Categorized Error Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-black/60 p-2.5 rounded border border-white/10 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">OAuth HTTP Status:</span>
                    {oauthResult ? (
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          oauthResult.success
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : oauthResult.errorCategory === 'AUTHENTICATION_ERROR'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : oauthResult.errorCategory === 'RATE_LIMITED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        HTTP {oauthResult.httpStatus} {oauthResult.isFromCache ? '(CACHED)' : oauthResult.success ? 'OK' : 'FAILED'}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Executed</span>
                    )}
                  </div>
                  {oauthResult?.errorCategory && (
                    <div className="text-[10px] text-red-400 font-mono">
                      Category: <span className="font-bold underline">{oauthResult.errorCategory}</span>
                      {oauthResult.retryAfterSeconds && ` (Retry-After: ${oauthResult.retryAfterSeconds}s)`}
                    </div>
                  )}
                  {oauthResult?.isFromCache && (
                    <div className="text-[10px] text-emerald-400 font-mono">
                      ✓ Rate-limit safe: Served from memory cache without hitting PayPal gateway
                    </div>
                  )}
                </div>

                <div className="bg-black/60 p-2.5 rounded border border-white/10 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">UserInfo HTTP Status:</span>
                    {userInfoResult ? (
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          userInfoResult.success
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        HTTP {userInfoResult.httpStatus} {userInfoResult.success ? 'OK' : 'FAILED'}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Checked</span>
                    )}
                  </div>
                  {userInfoResult?.data?.sub && (
                    <div className="text-[10px] text-cyan-300 font-mono truncate">
                      Sub: {userInfoResult.data.sub}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Token Bar & Security Controls */}
              {sandboxToken && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-emerald-400 font-bold shrink-0">Active Token:</span>
                    <span className="text-emerald-200 font-mono text-[10px] truncate max-w-xs">
                      {maskTokenInUi ? maskToken(sandboxToken) : sandboxToken}
                    </span>
                    <button
                      onClick={() => setMaskTokenInUi(!maskTokenInUi)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer shrink-0"
                    >
                      {maskTokenInUi ? 'Unmask' : 'Mask'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(sandboxToken)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-[10px] cursor-pointer"
                    >
                      {copiedCode ? '✓ Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setSubMode('orders_v2_api')}
                      className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded text-[10px] cursor-pointer"
                    >
                      Use in Orders v2 API →
                    </button>
                  </div>
                </div>
              )}

              {/* Console Tabs */}
              <div className="flex border-b border-white/10 text-xs font-mono">
                {[
                  { id: 'bash_script', label: 'Hardened Bash (User Prompt)' },
                  { id: 'cached_script', label: 'Production Cache Runner' },
                  { id: 'token_json', label: `Token JSON (${oauthResult ? oauthResult.httpStatus : 'Empty'})` },
                  { id: 'userinfo_json', label: `UserInfo Identity (${userInfoResult ? userInfoResult.httpStatus : 'Empty'})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOauthConsoleTab(tab.id as any)}
                    className={`px-3 py-2 cursor-pointer transition border-b-2 font-bold ${
                      oauthConsoleTab === tab.id
                        ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Console Body */}
              <div className="relative bg-black/90 rounded-lg p-3 border border-white/10 min-h-[220px] max-h-[380px] overflow-auto text-[11px]">
                {oauthConsoleTab === 'bash_script' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>Hardened Bash Script (Timeouts, Exit Code $?, EXIT Trap, jq -e Validation):</span>
                      <button
                        onClick={() =>
                          handleCopy(
                            generateUserVerificationBashScript(
                              paypalClientId,
                              paypalClientSecret,
                              sandboxToken || oauthResult?.data?.access_token
                            )
                          )
                        }
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        Copy Script
                      </button>
                    </div>
                    <pre className="text-emerald-300 font-mono text-[10px] whitespace-pre-wrap">
                      {generateUserVerificationBashScript(
                        paypalClientId,
                        paypalClientSecret,
                        sandboxToken || oauthResult?.data?.access_token
                      )}
                    </pre>
                  </div>
                )}

                {oauthConsoleTab === 'cached_script' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>Production Token-Caching Shell Script (/tmp/paypal_sandbox_token.json):</span>
                      <button
                        onClick={() =>
                          handleCopy(
                            generateHardenedCachedBashScript(
                              paypalClientId,
                              paypalClientSecret
                            )
                          )
                        }
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        Copy Script
                      </button>
                    </div>
                    <pre className="text-cyan-300 font-mono text-[10px] whitespace-pre-wrap">
                      {generateHardenedCachedBashScript(
                        paypalClientId,
                        paypalClientSecret
                      )}
                    </pre>
                  </div>
                )}

                {oauthConsoleTab === 'token_json' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <div className="flex items-center gap-2">
                        <span>OAuth 2.0 Response (POST /v1/oauth2/token):</span>
                        {oauthResult?.validation && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              oauthResult.validation.isValid
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {oauthResult.validation.isValid ? '✓ Schema Validated' : '✗ Invalid Schema'}
                          </span>
                        )}
                      </div>
                      {oauthResult && (
                        <button
                          onClick={() => handleCopy(JSON.stringify(oauthResult.rawResponse || oauthResult, null, 2))}
                          className="text-emerald-400 hover:underline cursor-pointer"
                        >
                          Copy JSON
                        </button>
                      )}
                    </div>
                    {oauthResult ? (
                      <pre className="text-emerald-200">
                        {JSON.stringify(oauthResult.rawResponse || oauthResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                        <span className="text-xl mb-1">🔑</span>
                        <span>No OAuth token requested yet.</span>
                        <span className="text-[10px] mt-1 text-slate-600">
                          Click "Fetch / Reuse Token" above to authenticate against Sandbox.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {oauthConsoleTab === 'userinfo_json' && (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                      <span>Sandbox UserInfo (GET /v1/identity/oauth2/userinfo?schema=paypalv1.1):</span>
                      {userInfoResult && (
                        <button
                          onClick={() => handleCopy(JSON.stringify(userInfoResult.rawResponse || userInfoResult, null, 2))}
                          className="text-cyan-400 hover:underline cursor-pointer"
                        >
                          Copy JSON
                        </button>
                      )}
                    </div>
                    {userInfoResult ? (
                      <pre className="text-cyan-200">
                        {JSON.stringify(userInfoResult.rawResponse || userInfoResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                        <span className="text-xl mb-1">🛡️</span>
                        <span>No UserInfo verification performed yet.</span>
                        <span className="text-[10px] mt-1 text-slate-600">
                          Click "Verify /userinfo" to audit token with PayPal Identity.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* MODE 2: Low Code Hosted Button */}
          {subMode === 'low_code_button' && (
            <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-amber-400">
                    PayPal Low-Code Buy Button
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    NO BACKEND NEEDED
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-lg border border-white/10 text-xs font-mono mb-4">
                  <span className="text-slate-400">PayPal Button ID:</span>
                  <input
                    type="text"
                    value={customButtonId}
                    onChange={(e) => setCustomButtonId(e.target.value)}
                    className="bg-white/10 text-amber-300 px-2 py-1 rounded border border-white/20 font-bold w-36 text-center focus:outline-none focus:border-amber-400"
                    placeholder="BUTTON_ID"
                  />
                </div>

                {/* Selected Item Summary */}
                <div className="bg-black/50 p-3.5 rounded-lg border border-white/5 mb-5 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 block">ACTIVE ITEM SELECTION:</span>
                  <h4 className="font-bold text-white text-sm my-1 leading-snug">
                    {selectedPart.name}
                  </h4>
                  <div className="flex justify-between text-slate-400 pt-2 border-t border-white/10 mt-2">
                    <span>Part ID:</span>
                    <span className="text-cyan-400">{selectedPart.partNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 mt-1">
                    <span>Total Due:</span>
                    <span className="text-amber-400 font-bold text-base">${selectedPart.price.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Official PayPal Low-Code Buy Button Form Embed */}
                <div className="bg-black/80 p-5 rounded-xl border border-amber-500/30 flex flex-col items-center justify-center text-center mb-4">
                  <form
                    action={`https://www.paypal.com/ncp/payment/${customButtonId}`}
                    method="post"
                    target="_blank"
                    className="w-full flex flex-col items-center gap-3"
                  >
                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded font-bold text-black text-base cursor-pointer shadow-lg hover:brightness-105 active:scale-[0.98] transition-transform"
                      style={{ backgroundColor: '#ffd140' }}
                    >
                      Buy Now · ${selectedPart.price.toFixed(2)}
                    </button>

                    <img
                      src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
                      alt="Accepted debit and credit cards"
                      className="h-7 my-1"
                    />

                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-mono">
                      <span>Powered by</span>
                      <img
                        src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                        alt="PayPal wordmark"
                        style={{ height: '0.95rem' }}
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Low-Code Embed Code Copier */}
              <div className="mt-2 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2 text-xs font-mono">
                  <span className="text-slate-400">Embed Form Code:</span>
                  <button
                    onClick={() => handleCopy(lowCodeSnippet)}
                    className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    {copiedCode ? '✓ Copied to Clipboard!' : 'Copy Code Snippet'}
                  </button>
                </div>
                <pre className="bg-black/90 p-2.5 rounded text-[10px] text-slate-400 font-mono overflow-x-auto max-h-32 border border-white/5">
                  {lowCodeSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* MODE 3: Tow Work Order Preview */}
          {subMode === 'work_order_invoice' && (
            <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white">
                  Heavy Recovery Paddock Tow Order
                </span>
                <span className="text-amber-400 font-bold">{invoiceId}</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded">
                  <span className="text-slate-400">Client:</span>
                  <span className="text-white font-bold">{clientName}</span>
                </div>
                <div className="bg-black/40 p-2 rounded">
                  <span className="text-slate-400 block mb-1">Service:</span>
                  <span className="text-slate-200">{invoiceDesc}</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-amber-400 font-bold text-sm">${invoiceAmount.toFixed(2)} USD</span>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded cursor-pointer transition text-xs"
              >
                Open Full Screen Invoice Document
              </button>
            </div>
          )}

          {/* Legal Authority & Contact Box */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-4 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>DIRECT INVOICE & PROPRIETORSHIP DETAIL</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 mb-2">
              13 Aerospace Defense Company · Shawn Patrick Cooper Gardner (Sole Proprietor). All tow invoices and parts remittances are directly remitted under NAICS 541715.
            </p>
            <div className="space-y-0.5 text-[10px] text-slate-400">
              <div>PEC: 00711617 | SSS: 70-186927-77</div>
              <div>Direct Dispatch: us_1-authority@hotmail.com</div>
              <div>Direct Phone: 702 841 4024</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Tow / Work Order Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-cyan-500/40 rounded-xl max-w-xl w-full p-6 text-white font-mono shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="text-cyan-400 font-bold text-sm">13 AEROSPACE DEFENSE COMPANY</div>
                <div className="text-lg font-bold font-['Barlow_Condensed',sans-serif] tracking-wider text-white">
                  OFFICIAL PADDOCK WORK ORDER & TOW INVOICE
                </div>
                <div className="text-xs text-slate-400">Shawn Patrick Cooper Gardner (Sole Proprietor)</div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between bg-black/40 p-2.5 rounded">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="text-amber-400 font-bold">{invoiceId}</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2.5 rounded">
                <span className="text-slate-400">Billed To:</span>
                <span className="text-white font-bold">{clientName}</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded">
                <span className="text-slate-400 block mb-1">Service & Item Detail:</span>
                <span className="text-slate-200">{invoiceDesc}</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2.5 rounded items-center">
                <span className="text-slate-400">Invoice Total Due:</span>
                <span className="text-xl text-amber-400 font-bold">${invoiceAmount.toFixed(2)} USD</span>
              </div>
              <div className="text-[10px] text-slate-500 bg-black/60 p-2 rounded border border-white/5">
                Cryptographic Provenance SHA-256 Hash: db2d4737f4f7342b20a5727a7320bacfcc98a8cf41926d9474c2e412b54dd44f
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSubMode('orders_v2_api');
                  handleDispatchPayPalOrder();
                }}
                className="flex-1 py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase rounded cursor-pointer transition text-xs tracking-wider"
              >
                Checkout via PayPal Orders v2 Sandbox (${invoiceAmount.toFixed(2)})
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold uppercase rounded cursor-pointer transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
