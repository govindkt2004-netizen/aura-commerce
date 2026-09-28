import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Check, AlertCircle, RefreshCw } from 'lucide-react';

export const PincodeChecker: React.FC = () => {
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('aura_delivery_pincode') || '';
  });
  const [inputVal, setInputVal] = useState(pincode);
  const [checkedLocation, setCheckedLocation] = useState<{
    city: string;
    days: number;
    codAvailable: boolean;
    dateStr: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(!pincode);

  // Approximate cities from leading digits
  const getCityFromPincode = (code: string) => {
    const prefix = code.slice(0, 2);
    switch (prefix) {
      case '11':
        return { city: 'New Delhi / NCR', days: 2 };
      case '40':
      case '41':
        return { city: 'Mumbai / Pune Region', days: 2 };
      case '56':
      case '57':
        return { city: 'Bengaluru / Karnataka', days: 2 };
      case '60':
      case '61':
      case '62':
        return { city: 'Chennai / Tamil Nadu', days: 3 };
      case '70':
        return { city: 'Kolkata Metropolitan', days: 3 };
      case '50':
        return { city: 'Hyderabad / Telangana', days: 2 };
      case '38':
        return { city: 'Ahmedabad / Gujarat', days: 2 };
      default:
        return { city: 'Standard Dispatch Zone', days: 4 };
    }
  };

  const calculateDelivery = (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter a valid 6-digit PIN code.');
      return false;
    }
    setError('');
    const { city, days } = getCityFromPincode(code);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

    setCheckedLocation({
      city,
      days,
      codAvailable: true,
      dateStr
    });
    localStorage.setItem('aura_delivery_pincode', code);
    setIsEditing(false);
    return true;
  };

  useEffect(() => {
    if (pincode && /^\d{6}$/.test(pincode)) {
      calculateDelivery(pincode);
    }
  }, []);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculateDelivery(inputVal.trim())) {
      setPincode(inputVal.trim());
    }
  };

  return (
    <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-700" />
          Delivery Availability & Timeline
        </span>
        {!isEditing && checkedLocation && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-semibold text-zinc-900 hover:text-amber-700 underline cursor-pointer"
          >
            Change PIN
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleCheck} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputVal}
              onChange={e => setInputVal(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit pincode"
              className="flex-1 bg-white border border-zinc-300 focus:border-zinc-950 focus:outline-hidden px-3 py-2 rounded-lg text-xs font-mono tracking-wider text-zinc-900"
            />
            <button
              type="submit"
              className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Verify
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-600 flex items-center gap-1">{error}</p>}
        </form>
      ) : (
        checkedLocation && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-900">
              <span className="font-semibold">Delivering to:</span>
              <span className="font-mono font-bold bg-zinc-200/70 px-2 py-0.5 rounded text-[11px]">
                {pincode}
              </span>
              <span className="text-zinc-500 text-[11px]">({checkedLocation.city})</span>
            </div>

            <div className="space-y-1.5 pt-1 text-zinc-600">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Expected Dispatch & Delivery by <strong>{checkedLocation.dateStr}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Complimentary express cargo over ₹4,999</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cash on Delivery (COD) available for this pin code</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>30-Day Hassle-Free Replacement & Atelier Guarantee</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
