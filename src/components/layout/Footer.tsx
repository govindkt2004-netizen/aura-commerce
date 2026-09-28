import React, { useState } from 'react';
import { Mail, CheckCircle2, Shield, Truck, Clock, RefreshCw } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  setSelectedCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, setSelectedCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 mt-20">
      {/* Value Proposition Ribbon */}
      <div className="border-b border-zinc-900/80 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 text-zinc-100 rounded-lg shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                  Insured Express Delivery
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Carbon-neutral expedited dispatch across India on all orders over ₹4,999.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 text-zinc-100 rounded-lg shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                  2-Year Master Warranty
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Guaranteed against mechanical flaws with bespoke concierge repair.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 text-zinc-100 rounded-lg shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                  30-Day Return Trial
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Experience any instrument in your home with prepaid returns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 text-zinc-100 rounded-lg shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                  Concierge Support
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Direct personal assistance from our design team 7 days a week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-zinc-950 flex items-center justify-center font-bold tracking-tighter text-sm rounded-sm">
                A
              </div>
              <span className="font-display font-bold tracking-tight text-xl text-white uppercase">
                Aura Atelier
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Consciously crafted instruments, tactile living objects, and sartorial wardrobe essentials designed with enduring materials and mathematical symmetry.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Join the Private Gazette
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are subscribed to private atelier previews.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('audio-tech');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Audio & Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('apparel-wardrobe');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Apparel & Wardrobe
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('minimalist-living');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Minimalist Living
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('fine-accessories');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Fine Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  All Archive Works
                </button>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentView('orders')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Concierge & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Shipping & Customs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Warranty Registration
                </button>
              </li>
            </ul>
          </div>

          {/* Studio & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              The Atelier
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors">
                  Our Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors">
                  Material Provenance
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
                >
                  Admin Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with payment indicators */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AURA Atelier Inc. All rights reserved. Crafted for enduring utility.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[10px] uppercase font-semibold text-zinc-400">
              UPI / QR
            </span>
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[10px] uppercase font-semibold text-zinc-400">
              RuPay / Visa / MC
            </span>
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[10px] uppercase font-semibold text-zinc-400">
              Net Banking
            </span>
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[10px] uppercase font-semibold text-zinc-400">
              256-Bit SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
