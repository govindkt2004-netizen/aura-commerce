import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, ChevronDown, ShieldCheck, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          The Atelier Manifesto
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight">
          Form, Function, Permanence.
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Founded on the philosophy that everyday instruments should be built with the mathematical symmetry of architecture and the permanence of fine sculpture.
        </p>
      </div>

      <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-zinc-900">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80"
          alt="Atelier Workshop"
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-zinc-600 leading-relaxed">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-950 font-display">Material Integrity</h3>
          <p>
            We reject ephemeral synthetic substitutes. Our acoustic diaphragms are crafted with pure beryllium-coated cellulose, our overcoats are spun from virgin Australian Merino fleece, and our bags are hand-stitched with vegetable-tanned leather from historic Tuscan tanneries.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-950 font-display">Zero-Carbon Fulfillment</h3>
          <p>
            Every shipment leaves our workshop in custom-molded, recycled unbleached fiber packaging. We calculate the exact carbon emissions of each transit leg and offset 100% of transport through verified reforestation initiatives.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is your standard fulfillment and delivery timeline?',
      a: 'All orders placed before 2:00 PM EST are inspected and dispatched on the same business day. Standard delivery takes 3 to 5 business days, while Priority Express offers guaranteed next-day delivery.'
    },
    {
      q: 'How does the 30-Day Risk-Free Trial work?',
      a: 'Every customer is entitled to experience their acquired instrument in their home for 30 days. If the tactile weight, fit, or acoustic profile does not surpass your highest standard, use the prepaid return label included inside the box for a full refund.'
    },
    {
      q: 'What does the 2-Year Atelier Warranty cover?',
      a: 'Our warranty covers all mechanical, structural, and electrical craftsmanship flaws. If any issue occurs, our concierge team will dispatch a bespoke replacement or provide concierge repair service free of charge.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Concierge Assistance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          How May We Assist You?
        </h1>
        <p className="text-sm text-zinc-600 max-w-lg mx-auto">
          Our client services team is at your disposal 7 days a week for sizing inquiries, technical specifications, and bespoke orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-zinc-950">Direct Client Inquiry</h3>
          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Message Dispatched
              </div>
              <p>A concierge will review your note and respond within 4 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="Eleanor Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="eleanor@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Inquiry Details
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="How can our curators assist you?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Details */}
        <div className="space-y-6 text-xs text-zinc-600">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 space-y-4">
            <h4 className="font-bold text-sm text-zinc-950">Atelier Studio HQ</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                <span>450 Grand Architectural Way, Suite 800, New York, NY 10013</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-800 shrink-0" />
                <span>concierge@aura.store</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-zinc-800 shrink-0" />
                <span>+1 (800) 482-2872 (Toll Free)</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 space-y-2">
            <h4 className="font-bold text-sm text-zinc-950">Studio Hours</h4>
            <p>Monday – Friday: 8:00 AM – 8:00 PM EST</p>
            <p>Saturday – Sunday: 10:00 AM – 5:00 PM EST</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-6 border-t border-zinc-200">
        <h3 className="font-display font-bold text-xl text-zinc-950">
          Frequently Inquired Questions
        </h3>

        <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-zinc-900"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="text-xs sm:text-sm text-zinc-600 mt-3 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-sm text-zinc-600 leading-relaxed">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-3xl font-extrabold text-zinc-950 font-display">Client Privacy Policy</h1>
        <p className="text-xs text-zinc-400 mt-1">Effective as of January 1, 2026</p>
      </div>

      <p>
        At AURA Atelier, protecting your personal integrity and transaction data is our foundational commitment. We enforce 256-bit SSL encryption across every communication channel and never sell your personal contact records to third-party advertising syndicates.
      </p>

      <h3 className="text-base font-bold text-zinc-950">1. Information We Collect</h3>
      <p>
        We collect only the essential details required to safely dispatch your acquisitions: name, shipping destination, payment intent tokens provided by Stripe, and email address for shipment telemetry and invoices.
      </p>

      <h3 className="text-base font-bold text-zinc-950">2. Payment Security</h3>
      <p>
        All credit card numbers are handled directly by Stripe in PCI-DSS Level 1 certified facilities. Our web servers never store, log, or inspect raw credit card numbers or security codes.
      </p>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-sm text-zinc-600 leading-relaxed">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-3xl font-extrabold text-zinc-950 font-display">Terms of Service</h1>
        <p className="text-xs text-zinc-400 mt-1">Effective as of January 1, 2026</p>
      </div>

      <p>
        By purchasing from or browsing the AURA Atelier archive, you agree to our terms of inspection, warranty conditions, and carbon-neutral transit policies.
      </p>

      <h3 className="text-base font-bold text-zinc-950">1. Authenticity Guarantee</h3>
      <p>
        Every instrument shipped through our platform is individually serialized, inspected, and guaranteed authentic under our 2-Year Atelier Master Warranty.
      </p>
    </div>
  );
};
