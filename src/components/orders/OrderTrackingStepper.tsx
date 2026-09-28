import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Sparkles,
  PhoneCall,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';

export type TrackingStepKey = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface TrackingStepInfo {
  key: TrackingStepKey;
  stepNumber: number;
  label: string;
  tagline: string;
  location: string;
  estimatedTime: string;
  narrative: string;
  statusBadge: string;
}

interface OrderTrackingStepperProps {
  order: Order;
  onOrderUpdated?: (updatedOrder: Order) => void;
  onContactConcierge?: (orderId: string) => void;
  onDownloadInvoice?: (order: Order) => void;
  compact?: boolean;
}

export const OrderTrackingStepper: React.FC<OrderTrackingStepperProps> = ({
  order,
  onOrderUpdated,
  onContactConcierge,
  onDownloadInvoice,
  compact = false
}) => {
  // Normalize current status into one of the 4 steps
  const normalizeStatus = (status?: string): TrackingStepKey => {
    switch (status) {
      case 'shipped':
        return 'shipped';
      case 'out_for_delivery':
        return 'out_for_delivery';
      case 'delivered':
        return 'delivered';
      case 'pending':
      case 'confirmed':
      case 'processing':
      default:
        return 'processing';
    }
  };

  const currentStepKey = normalizeStatus(order.orderStatus || order.status);

  // Allow clicking on any step to inspect its checkpoint dossier
  const [selectedStepKey, setSelectedStepKey] = useState<TrackingStepKey>(currentStepKey);

  // Sync selected step if the order's status changes
  useEffect(() => {
    setSelectedStepKey(normalizeStatus(order.orderStatus || order.status));
  }, [order.orderStatus, order.status]);

  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [showSimulatorControls, setShowSimulatorControls] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const trackingNumber = order.trackingNumber || `BD-APEX-${order.id.replace(/\D/g, '').padEnd(8, '0').slice(0, 8)}`;
  const destinationCity = order.shippingAddress?.city || 'Mumbai';
  const destinationState = order.shippingAddress?.state || 'Maharashtra';
  const destinationZip = order.shippingAddress?.zipCode || order.shippingAddress?.zip || '400001';

  // The 4 Core Step Definitions
  const STEPS: TrackingStepInfo[] = [
    {
      key: 'processing',
      stepNumber: 1,
      label: 'Processing',
      tagline: 'Precision assembly & quality inspection',
      location: 'AURA Central Atelier, Lower Parel, Mumbai',
      estimatedTime: 'Completed on ' + new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      narrative: 'Your bespoke artifact has passed our 3-stage mechanical tolerance calibration and optical review. It has been sealed in climate-stabilized shockproof packaging with tamper-evident holograms.',
      statusBadge: 'Quality Approved'
    },
    {
      key: 'shipped',
      stepNumber: 2,
      label: 'Shipped',
      tagline: 'Dispatched via Blue Dart Apex Air Cargo',
      location: 'Air Cargo Transit Hub · Mumbai International Airport (BOM)',
      estimatedTime: 'Dispatched · Airway Bill Generated',
      narrative: 'Consignment handed over to Blue Dart Apex Priority Logistics. The cargo container is equipped with active GPS tracking and tilt-detection telemetry for high-value horological security.',
      statusBadge: 'In Transit'
    },
    {
      key: 'out_for_delivery',
      stepNumber: 3,
      label: 'Out for Delivery',
      tagline: 'With delivery officer for final-mile courier',
      location: `${destinationCity} Express Sorting Hub · Vehicle #MH-02-CE-8821`,
      estimatedTime: 'Today between 10:00 AM – 1:00 PM',
      narrative: 'Your consignment is on board the final-mile climate-controlled delivery van. The courier officer will contact your on-file number 30 minutes before arrival. Please share your delivery PIN upon handover.',
      statusBadge: 'On Delivery Route'
    },
    {
      key: 'delivered',
      stepNumber: 4,
      label: 'Delivered',
      tagline: 'Handed over & digital seal verified',
      location: `${destinationCity}, ${destinationState} ${destinationZip}`,
      estimatedTime: 'Completed with Recipient Signature',
      narrative: 'Artifact successfully delivered to the recipient address. Proof-of-delivery signature verified. Your 30-day Atelier trial window and 2-year international warranty are now active.',
      statusBadge: 'Delivery Verified'
    }
  ];

  const getStepIndex = (key: TrackingStepKey) => {
    switch (key) {
      case 'processing': return 0;
      case 'shipped': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
    }
  };

  const currentStepIndex = getStepIndex(currentStepKey);
  const selectedStepIndex = getStepIndex(selectedStepKey);

  // Handle Copy Tracking
  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Status advancement handler (interactive simulator)
  const handleAdvanceStatus = async (targetKey: TrackingStepKey) => {
    setUpdatingStatus(true);
    try {
      const res = await api.updateOrderTrackingStatus(
        order.id,
        targetKey,
        `Customer advanced status to ${targetKey.replace(/_/g, ' ').toUpperCase()}`
      );
      if (res.order && onOrderUpdated) {
        onOrderUpdated(res.order);
      }
      setSelectedStepKey(targetKey);
      setStatusFeedback(`Status updated to "${targetKey.replace(/_/g, ' ').toUpperCase()}"`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      // Fallback local update if network error
      const mockUpdated: Order = {
        ...order,
        orderStatus: targetKey,
        status: targetKey,
        updatedAt: new Date().toISOString()
      };
      if (onOrderUpdated) onOrderUpdated(mockUpdated);
      setSelectedStepKey(targetKey);
      setStatusFeedback(`Status simulated to "${targetKey.replace(/_/g, ' ').toUpperCase()}"`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Auto-play simulator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlayActive) {
      const stepSequence: TrackingStepKey[] = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
      const currentIndex = stepSequence.indexOf(currentStepKey);
      if (currentIndex < stepSequence.length - 1) {
        timer = setTimeout(() => {
          handleAdvanceStatus(stepSequence[currentIndex + 1]);
        }, 2400);
      } else {
        setAutoPlayActive(false);
      }
    }
    return () => clearTimeout(timer);
  }, [autoPlayActive, currentStepKey]);

  // Selected Step Info
  const activeDossier = STEPS[selectedStepIndex];

  // Progress Bar Percentage calculation
  const progressPercentage = (currentStepIndex / 3) * 100;

  // Mocked Scan Checkpoints for Timeline
  const scanCheckpoints = [
    {
      time: 'Today, 08:45 AM',
      facility: `${destinationCity} Local Distribution Hub`,
      event: 'Dispatched on delivery van MH-02-CE-8821 with courier agent Ramesh K.',
      statusKey: 'out_for_delivery'
    },
    {
      time: 'Yesterday, 11:20 PM',
      facility: `${destinationCity} Gateway Air Logistics Center`,
      event: 'Inward flight arrival scan. Transferred to overnight regional container.',
      statusKey: 'shipped'
    },
    {
      time: 'Yesterday, 04:30 PM',
      facility: 'Mumbai Chhatrapati Shivaji Cargo Terminal (BOM)',
      event: 'Loaded onto flight BD-491 priority cargo bay. Airway bill verified.',
      statusKey: 'shipped'
    },
    {
      time: '2 days ago, 06:15 PM',
      facility: 'AURA Central Atelier, Lower Parel, Mumbai',
      event: 'Handed over to Blue Dart armored pickup vehicle. Security bar code sealed.',
      statusKey: 'processing'
    },
    {
      time: '2 days ago, 02:00 PM',
      facility: 'AURA Quality Assurance Lab',
      event: 'Inspection passed: 100% cosmetic and functional tolerance certificate issued.',
      statusKey: 'processing'
    },
    {
      time: new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      facility: 'AURA Atelier Digital Terminal',
      event: 'Order authorized. Payment verified via Stripe. Production docket queued.',
      statusKey: 'processing'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden transition-all ${compact ? 'p-4' : 'p-6 sm:p-7'}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Live Delivery Pipeline
            </span>
            <span className="text-zinc-300">·</span>
            <span className="font-mono text-xs font-bold text-zinc-950">
              #{order.id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800">
              <span className={`w-1.5 h-1.5 rounded-full ${currentStepKey === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              {currentStepKey === 'delivered' ? 'Delivered' : currentStepKey === 'out_for_delivery' ? 'Out for Delivery' : currentStepKey === 'shipped' ? 'In Transit' : 'Processing'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-zinc-500">
            <span>Carrier: <strong className="text-zinc-800 font-medium">Blue Dart Apex Express</strong></span>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center gap-1">
              <span>AWB:</span>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="font-mono text-zinc-900 font-semibold hover:text-zinc-600 inline-flex items-center gap-1 cursor-pointer"
                title="Copy tracking number"
              >
                <span>{trackingNumber}</span>
                {copiedTracking ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-zinc-400 hover:text-zinc-700" />
                )}
              </button>
            </span>
            {copiedTracking && (
              <span className="text-[10px] text-emerald-600 font-medium">Copied to clipboard</span>
            )}
          </div>
        </div>

        {/* Top Actions & Simulator Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSimulatorControls(!showSimulatorControls)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSimulatorControls
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Flow</span>
          </button>

          {onDownloadInvoice && (
            <button
              type="button"
              onClick={() => onDownloadInvoice(order)}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="Download Tax Invoice"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* INTERACTIVE SIMULATOR CONTROL BAR (Collapsible) */}
      <AnimatePresence>
        {showSimulatorControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Simulate Status Flow Transitions
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click any milestone button or test the end-to-end delivery sequence in real time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => setAutoPlayActive(!autoPlayActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      autoPlayActive
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <Play className={`w-3 h-3 ${autoPlayActive ? 'animate-spin' : ''}`} />
                    <span>{autoPlayActive ? 'Pause Auto-Play' : 'Auto-Play Journey'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleAdvanceStatus('processing')}
                    className="p-1.5 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    title="Reset to Processing"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Jump Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {STEPS.map(step => {
                  const isCurrent = currentStepKey === step.key;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleAdvanceStatus(step.key)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">Step {step.stepNumber}</span>
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <div className="font-semibold text-xs mt-0.5">{step.label}</div>
                    </button>
                  );
                })}
              </div>

              {statusFeedback && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{statusFeedback}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-STEP VISUAL STEPPER TRACK */}
      <div className="mt-8 mb-6 relative">
        {/* Connecting Progress Track Line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-zinc-200 z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full bg-zinc-950"
          />
        </div>

        {/* The 4 Step Nodes */}
        <div className="grid grid-cols-4 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;
            const isInspecting = selectedStepKey === step.key;

            return (
              <div
                key={step.key}
                onClick={() => setSelectedStepKey(step.key)}
                className="flex flex-col items-center text-center cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${step.label} stage`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedStepKey(step.key);
                }}
              >
                {/* Step Circle Node */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                    isCompleted
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-zinc-950 text-zinc-950 ring-4 ring-zinc-950/15 font-bold shadow-md scale-110'
                      : 'bg-white border-zinc-300 text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600'
                  } ${isInspecting ? 'ring-2 ring-offset-2 ring-zinc-900' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : idx === 0 ? (
                    <Package className="w-4 h-4" />
                  ) : idx === 1 ? (
                    <Truck className="w-4 h-4" />
                  ) : idx === 2 ? (
                    <Navigation className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>

                {/* Step Text Label */}
                <div className="mt-3 px-1">
                  <div
                    className={`text-xs font-bold tracking-tight transition-colors ${
                      isCurrent
                        ? 'text-zinc-950'
                        : isCompleted
                        ? 'text-zinc-800'
                        : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="hidden sm:block text-[11px] text-zinc-400 mt-0.5 line-clamp-1 max-w-[130px]">
                    {step.tagline}
                  </div>
                </div>

                {/* Live Pulse Indicator for Current Step */}
                {isCurrent && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                    Active Stage
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED MILESTONE DOSSIER CARD */}
      <div className="mt-6 p-5 sm:p-6 bg-zinc-50/80 rounded-xl border border-zinc-200/90 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Milestone Dossier {activeDossier.stepNumber} of 4
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs font-semibold text-zinc-900">
                {activeDossier.statusBadge}
              </span>
              {selectedStepIndex <= currentStepIndex && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
              <span>{activeDossier.label}</span>
              <span className="text-xs font-normal text-zinc-400">({activeDossier.tagline})</span>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {activeDossier.narrative}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium text-zinc-700">{activeDossier.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-600">{activeDossier.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Context Action Box */}
          <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px] border-t md:border-t-0 md:border-l border-zinc-200/80 pt-4 md:pt-0 md:pl-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Delivery Handover Code
            </div>
            <div className="p-2.5 bg-white border border-zinc-200 rounded-lg text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-medium">OTP PIN</span>
              <span className="font-mono text-base font-extrabold tracking-widest text-zinc-950">
                {Math.abs(order.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7) % 9000 + 1000)}
              </span>
            </div>

            {onContactConcierge && (
              <button
                type="button"
                onClick={() => onContactConcierge(order.id)}
                className="w-full mt-1 px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-zinc-500" />
                <span>Contact Courier Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* COURIER ROUTE VISUALIZATION */}
        <div className="mt-5 pt-4 border-t border-zinc-200/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Real-Time Logistics Waypoints
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2.5 rounded-lg border ${currentStepIndex >= 0 ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-zinc-400">Origin</span>
                {currentStepIndex >= 0 && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="font-medium text-xs mt-0.5">Mumbai Central Atelier</div>
              <div className="text-[10px] text-zinc-400">Packaging & Dispatch</div>
            </div>

            <div className={`p-2.5 rounded-lg border ${currentStepIndex >= 1 ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-zinc-400">Transit Node</span>
                {currentStepIndex >= 1 && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="font-medium text-xs mt-0.5">Air Cargo Terminal</div>
              <div className="text-[10px] text-zinc-400">Blue Dart Express Hub</div>
            </div>

            <div className={`p-2.5 rounded-lg border ${currentStepIndex >= 2 ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-zinc-400">Delivery Hub</span>
                {currentStepIndex >= 2 && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="font-medium text-xs mt-0.5">{destinationCity} Sorting Center</div>
              <div className="text-[10px] text-zinc-400">Assigned to Local Courier</div>
            </div>

            <div className={`p-2.5 rounded-lg border ${currentStepIndex >= 3 ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-zinc-400">Destination</span>
                {currentStepIndex >= 3 && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="font-medium text-xs mt-0.5">Recipient Address</div>
              <div className="text-[10px] text-zinc-400">{destinationCity} {destinationZip}</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDABLE FULL CHECKPOINT LOGS TIMELINE */}
      <div className="mt-4 pt-3 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => setShowFullTimeline(!showFullTimeline)}
          className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center justify-between rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Full Scan Activity & Telemetry ({scanCheckpoints.length} scans recorded)</span>
          </span>
          {showFullTimeline ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        <AnimatePresence>
          {showFullTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 pl-3 border-l-2 border-zinc-200 my-2">
                {scanCheckpoints.map((scan, i) => (
                  <div key={i} className="relative pl-4 text-xs space-y-0.5">
                    <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-zinc-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">{scan.facility}</span>
                      <span className="text-[11px] text-zinc-400">{scan.time}</span>
                    </div>
                    <p className="text-zinc-500 text-xs">{scan.event}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
