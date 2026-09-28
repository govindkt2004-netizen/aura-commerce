import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Flame,
  Scale,
  ChevronDown,
  ArrowRight,
  Package,
  Bookmark,
  Ticket,
  Bell,
  Star,
  MapPin,
  LifeBuoy,
  Lock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { NotificationCenter } from '../common/NotificationCenter';
import { SiteSettings } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setSelectedCategory: (cat: string) => void;
  onOpenSearch: () => void;
  siteSettings?: SiteSettings | null;
  announcementBar?: { enabled: boolean; text: string; link?: string } | null;
  onSelectDashboardTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  setSelectedCategory,
  onOpenSearch,
  siteSettings,
  announcementBar,
  onSelectDashboardTab
}) => {
  const { user, isAdmin, setShowAuthModal, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const handleCategoryNav = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setCurrentView('shop');
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const isAnnouncementVisible = announcementBar ? announcementBar.enabled : true;
  const announcementText =
    announcementBar?.text ||
    'Complimentary insured express shipping across India on orders over ₹4,999 · Use code WELCOME10 for 10% off';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 transition-colors">
      {/* Top promotional announcement ribbon */}
      {isAnnouncementVisible && (
        <div className="bg-zinc-950 text-zinc-300 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              id="brand-logo"
              onClick={() => {
                setCurrentView('home');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center font-bold tracking-tighter text-sm rounded-sm group-hover:bg-zinc-800 transition-colors shadow-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold tracking-tight text-xl text-zinc-950 uppercase leading-none">
                  {siteSettings?.storeName || 'Aura'}
                </span>
                <span className="text-[9px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">
                  {siteSettings?.tagline ? 'Atelier' : 'Atelier'}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-700">
            <button
              onClick={() => {
                setCurrentView('home');
                setSelectedCategory('all');
              }}
              className={`transition-colors hover:text-zinc-950 ${
                currentView === 'home' ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 pb-1' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentView('shop');
                setSelectedCategory('all');
              }}
              className={`transition-colors hover:text-zinc-950 ${
                currentView === 'shop' ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 pb-1' : ''
              }`}
            >
              Shop All
            </button>
            <button
              id="navbar-deals-link"
              onClick={() => setCurrentView('deals')}
              className={`transition-colors hover:text-amber-600 flex items-center gap-1 font-semibold ${
                currentView === 'deals' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-amber-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Deals</span>
            </button>

            {/* Interactive Animated Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                id="mega-menu-trigger"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-1 py-1 transition-colors hover:text-zinc-950 font-medium cursor-pointer ${
                  megaMenuOpen ? 'text-zinc-950' : 'text-zinc-700'
                }`}
              >
                <span>Collections & Mega Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[850px] bg-white rounded-2xl shadow-2xl border border-zinc-200/90 p-6 z-50 overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* Column 1: Audio & Tech */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleCategoryNav('audio-tech')}
                          className="font-bold text-xs uppercase tracking-wider text-zinc-950 hover:text-amber-600 flex items-center gap-1.5 transition-colors text-left"
                        >
                          <span>Audio & Acoustics</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </button>
                        <div className="space-y-2 text-xs text-zinc-500">
                          <button onClick={() => handleCategoryNav('audio-tech')} className="block hover:text-zinc-950 transition-colors text-left">
                            Beryllium ANC Headphones
                          </button>
                          <button onClick={() => handleCategoryNav('audio-tech')} className="block hover:text-zinc-950 transition-colors text-left">
                            Nearfield Studio Monitors
                          </button>
                          <button onClick={() => handleCategoryNav('audio-tech')} className="block hover:text-zinc-950 transition-colors text-left">
                            Gasket Mechanical Keyboards
                          </button>
                          <button onClick={() => handleCategoryNav('audio-tech')} className="block hover:text-zinc-950 transition-colors text-left">
                            Lossless DAC Cables
                          </button>
                        </div>
                      </div>

                      {/* Column 2: Minimalist Living */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleCategoryNav('minimalist-living')}
                          className="font-bold text-xs uppercase tracking-wider text-zinc-950 hover:text-amber-600 flex items-center gap-1.5 transition-colors text-left"
                        >
                          <span>Mindful Living</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </button>
                        <div className="space-y-2 text-xs text-zinc-500">
                          <button onClick={() => handleCategoryNav('minimalist-living')} className="block hover:text-zinc-950 transition-colors text-left">
                            Artisanal Pour-Over & Stoneware
                          </button>
                          <button onClick={() => handleCategoryNav('minimalist-living')} className="block hover:text-zinc-950 transition-colors text-left">
                            Smoked Hinoki Botanical Candles
                          </button>
                          <button onClick={() => handleCategoryNav('minimalist-living')} className="block hover:text-zinc-950 transition-colors text-left">
                            Solid Brass Workspace Trays
                          </button>
                          <button onClick={() => handleCategoryNav('minimalist-living')} className="block hover:text-zinc-950 transition-colors text-left">
                            Handblown Double-Wall Carafes
                          </button>
                        </div>
                      </div>

                      {/* Column 3: Fine Accessories */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleCategoryNav('fine-accessories')}
                          className="font-bold text-xs uppercase tracking-wider text-zinc-950 hover:text-amber-600 flex items-center gap-1.5 transition-colors text-left"
                        >
                          <span>Fine Accessories</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </button>
                        <div className="space-y-2 text-xs text-zinc-500">
                          <button onClick={() => handleCategoryNav('fine-accessories')} className="block hover:text-zinc-950 transition-colors text-left">
                            Swiss Automatic Chronographs
                          </button>
                          <button onClick={() => handleCategoryNav('fine-accessories')} className="block hover:text-zinc-950 transition-colors text-left">
                            Vegetable-Tanned Wallets
                          </button>
                          <button onClick={() => handleCategoryNav('fine-accessories')} className="block hover:text-zinc-950 transition-colors text-left">
                            Hand-Forged Titanium Pens
                          </button>
                          <button onClick={() => handleCategoryNav('fine-accessories')} className="block hover:text-zinc-950 transition-colors text-left">
                            Heritage Weekender Bags
                          </button>
                        </div>
                      </div>

                      {/* Column 4: Curated Highlight Card */}
                      <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/80 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Atelier Feature
                          </span>
                          <h4 className="font-display font-bold text-xs text-zinc-950 mt-2">
                            AURA Pro Acoustics
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                            Custom 40mm beryllium drivers & spatial audio.
                          </p>
                        </div>
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                          alt="Featured Product"
                          className="w-full h-24 object-cover rounded-lg my-2"
                        />
                        <button
                          onClick={() => handleCategoryNav('audio-tech')}
                          className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-semibold text-center cursor-pointer transition-colors"
                        >
                          View Collection
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleCategoryNav('audio-tech')}
              className="transition-colors hover:text-zinc-950"
            >
              Audio
            </button>
            <button
              onClick={() => handleCategoryNav('apparel-wardrobe')}
              className="transition-colors hover:text-zinc-950"
            >
              Wardrobe
            </button>
            <button
              onClick={() => handleCategoryNav('minimalist-living')}
              className="transition-colors hover:text-zinc-950"
            >
              Living
            </button>
            <button
              onClick={() => handleCategoryNav('fine-accessories')}
              className="transition-colors hover:text-zinc-950"
            >
              Accessories
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className={`transition-colors hover:text-zinc-950 ${
                currentView === 'about' ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 pb-1' : ''
              }`}
            >
              Our Story
            </button>
          </nav>

          {/* Right: Actions (Search, Wishlist, Cart, User) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Trigger */}
            <button
              id="search-btn"
              onClick={onOpenSearch}
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search Catalog"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={() => setCurrentView('wishlist')}
              className="relative p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="View Wishlist"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-drawer-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="View Shopping Bag"
              title="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-zinc-950 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-scale shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Notification Center */}
            <NotificationCenter onNavigate={(view) => setCurrentView(view)} />

            {/* Direct Admin Access Button */}
            {isAdmin && (
              <button
                id="navbar-admin-quick-btn"
                onClick={() => setCurrentView('admin')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Admin</span>
              </button>
            )}

            {/* User Profile / Menu */}
            <div className="relative">
              {user ? (
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-zinc-200"
                  aria-label="User profile options"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-900 leading-tight">
                      Hi, {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Account</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  {isAdmin && (
                    <span className="hidden sm:inline-flex items-center text-[10px] font-semibold bg-zinc-950 text-white px-1.5 py-0.5 rounded-xs">
                      Admin
                    </span>
                  )}
                </button>
              ) : (
                <button
                  id="signin-btn"
                  onClick={() => setCurrentView('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-zinc-950 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login / Account</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-zinc-200/90 py-2 z-50 divide-y divide-zinc-100 overflow-hidden"
                  >
                    {/* User Header */}
                    <div className="px-4 py-3 bg-zinc-50/70">
                      <p className="text-xs font-bold text-zinc-950 truncate">Hi, {user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-800">
                          {user.role} patron
                        </span>
                        {isAdmin && (
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-zinc-950">
                            Superadmin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Items (11 Required Marketplace Items) */}
                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('orders');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-zinc-400" />
                        <span>My Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('wishlist');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-zinc-400" />
                        <span>Wishlist ({wishlistCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('saved-for-later');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-zinc-400" />
                        <span>Saved for Later</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('coupons');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-zinc-400" />
                        <span>Coupons & Offers</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('notifications');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-zinc-400" />
                        <span>Notifications</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('reviews');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Star className="w-4 h-4 text-zinc-400" />
                        <span>My Reviews</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('addresses');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span>My Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('tickets');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LifeBuoy className="w-4 h-4 text-zinc-400" />
                        <span>Customer Support</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          onSelectDashboardTab?.('security');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-zinc-400" />
                        <span>Account Settings & Security</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-amber-900 bg-amber-50 hover:bg-amber-100/90 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Admin Portal</span>
                        </button>
                      )}
                    </div>

                    {/* Logout Option */}
                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          setCurrentView('home');
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3"
          >
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-base font-medium text-zinc-900 rounded-md hover:bg-zinc-100"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('all');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-base font-medium text-zinc-900 rounded-md hover:bg-zinc-100"
              >
                Shop All Products
              </button>
              <button
                onClick={() => {
                  setCurrentView('deals');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-base font-semibold text-amber-600 rounded-md hover:bg-amber-50 flex items-center gap-2"
              >
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Deals & Promotional Vault</span>
              </button>
              <button
                onClick={() => handleCategoryNav('audio-tech')}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                Audio & Tech
              </button>
              <button
                onClick={() => handleCategoryNav('apparel-wardrobe')}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                Apparel & Wardrobe
              </button>
              <button
                onClick={() => handleCategoryNav('minimalist-living')}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                Minimalist Living
              </button>
              <button
                onClick={() => handleCategoryNav('fine-accessories')}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                Fine Accessories
              </button>
              <button
                onClick={() => {
                  setCurrentView('about');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setCurrentView('contact');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-base text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                Contact & Support
              </button>
            </div>

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-lg">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 text-sm text-left text-zinc-800 hover:bg-zinc-100 rounded-md"
                  >
                    Customer Profile & Orders
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 text-sm text-left text-amber-700 font-semibold bg-amber-50 rounded-md flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Console
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 text-sm text-left text-rose-600 hover:bg-rose-50 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-zinc-950 text-white rounded-md text-sm font-semibold text-center"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
