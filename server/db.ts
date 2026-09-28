import fs from 'fs';
import path from 'path';
import { validateAndNormalizeIndianPhone } from './smsService';
import {
  Product,
  Category,
  User,
  Order,
  AdminStats,
  Address,
  Coupon,
  Banner,
  HomepageContent,
  SiteSettings,
  AdminActivityLog,
  ProductQuestion,
  ReturnRequest,
  Brand,
  SupportTicket,
  FAQItem
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  carts: Record<string, { productId: string; quantity: number; selectedSize?: string; selectedColor?: string }[]>;
  wishlists: Record<string, string[]>; // userId -> productIds
  coupons: Coupon[];
  banners: Banner[];
  siteSettings: SiteSettings;
  homepageContent: HomepageContent;
  adminActivityLogs: AdminActivityLog[];
  questions: ProductQuestion[];
  returnRequests: ReturnRequest[];
  supportTickets: SupportTicket[];
  faqs: FAQItem[];
}

// Initial rich seed data
const initialCategories: Category[] = [
  {
    id: 'cat-audio-tech',
    name: 'Audio & Tech',
    slug: 'audio-tech',
    description: 'Precision engineered acoustic instruments and workspace electronics designed for tactile clarity.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productCount: 3
  },
  {
    id: 'cat-fashion',
    name: 'Apparel & Wardrobe',
    slug: 'apparel-wardrobe',
    description: 'Timeless silhouettes crafted from sustainably harvested natural fibers and organic textiles.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    productCount: 3
  },
  {
    id: 'cat-home',
    name: 'Minimalist Living',
    slug: 'minimalist-living',
    description: 'Tactile ceramics, ambient illumination, and bespoke objects that elevate everyday rituals.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    productCount: 3
  },
  {
    id: 'cat-accessories',
    name: 'Fine Accessories',
    slug: 'fine-accessories',
    description: 'Full-grain heritage leathers, precision chronographs, and titanium eyewear built to endure.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    productCount: 3
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-aura-pro-headphones',
    name: 'AURA Pro Active Noise-Cancelling Headphones',
    slug: 'aura-pro-anc-headphones',
    tagline: 'Custom 40mm beryllium drivers with 38-hour battery and spatial audio.',
    description: 'Engineered for uncompromising audiophiles. The AURA Pro features custom 40mm beryllium acoustic transducers, adaptive active noise cancellation with 4-mic beamforming arrays, and premium lambskin memory foam ear cushions.',
    detailedDescription: 'The AURA Pro is the culmination of three years of acoustic engineering. Housed in a precision CNC-machined aerospace aluminum chassis, each acoustic chamber is individually tuned to eliminate internal resonance. Enjoy high-resolution LDAC and aptX Adaptive codecs alongside our proprietary spatial audio algorithm that places you right at the center of the recording studio.',
    price: 29999,
    compareAtPrice: 34999,
    category: 'Audio & Tech',
    categorySlug: 'audio-tech',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 24,
    rating: 4.9,
    reviewCount: 142,
    isFeatured: true,
    isNewArrival: false,
    tags: ['wireless', 'noise-cancelling', 'audiophile', 'bluetooth 5.3', 'best-seller'],
    variants: {
      colors: [
        { name: 'Matte Obsidian', hex: '#18181b' },
        { name: 'Warm Sandstone', hex: '#d6c7b2' },
        { name: 'Brushed Silver', hex: '#e4e4e7' }
      ]
    },
    specs: [
      { label: 'Driver Type', value: '40mm Custom Beryllium Diaphragms' },
      { label: 'Frequency Response', value: '10Hz – 45,000Hz' },
      { label: 'Battery Life', value: 'Up to 38 hours (ANC ON)' },
      { label: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Analog / USB-C Lossless' },
      { label: 'Weight', value: '254 grams' }
    ],
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Marcus Vance',
        rating: 5,
        title: 'Studio quality in an everyday form factor',
        comment: 'The instrument separation on these is breathtaking. Far superior clarity compared to the Sony WH-1000XM5 and AirPods Max. The lambskin cushions remain comfortable even after 8 hours at my desk.',
        date: '2026-08-14',
        verifiedPurchase: true
      },
      {
        id: 'rev-2',
        authorName: 'Elena Rostova',
        rating: 5,
        title: 'Build quality is second to none',
        comment: 'Tactile buttons instead of frustrating touch swipes! The ANC silences cafe chatter completely without any ear pressure sensation.',
        date: '2026-07-29',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-horizon-watch',
    name: 'AURA Horizon Automatic Chronograph',
    slug: 'aura-horizon-automatic-chronograph',
    tagline: 'Swiss mechanical movement, sapphire crystal, and vegetable-tanned Italian bridle leather.',
    description: 'An understated masterpiece of horology. Featuring a 28,800 bph automatic caliber with a 42-hour power reserve, double-domed anti-reflective sapphire crystal, and an exhibition caseback showcasing Geneva stripes.',
    detailedDescription: 'Designed in Copenhagen and assembled by master watchmakers, the Horizon Chronograph pairs minimalist mid-century Bauhaus symmetry with rigorous mechanical resilience. Water resistant to 10 ATM (100 meters), it seamlessly transitions from morning laps to black-tie galas.',
    price: 49999,
    compareAtPrice: 59999,
    category: 'Fine Accessories',
    categorySlug: 'fine-accessories',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 12,
    rating: 4.8,
    reviewCount: 89,
    isFeatured: true,
    isNewArrival: true,
    tags: ['automatic', 'mechanical', 'swiss movement', 'sapphire', 'luxury'],
    variants: {
      colors: [
        { name: 'Midnight Charcoal', hex: '#27272a' },
        { name: 'Arctic White', hex: '#f4f4f5' },
        { name: 'Heritage Brown', hex: '#78350f' }
      ]
    },
    specs: [
      { label: 'Movement', value: 'Caliber SW510 Automatic Chronograph (28,800 A/h)' },
      { label: 'Case Diameter', value: '39.5mm' },
      { label: 'Case Thickness', value: '11.8mm' },
      { label: 'Water Resistance', value: '10 ATM (100m / 330ft)' },
      { label: 'Strap', value: 'Quick-release Italian vegetable-tanned leather' }
    ],
    reviews: [
      {
        id: 'rev-3',
        authorName: 'David Sterling',
        rating: 5,
        title: 'Heirloom level craftsmanship',
        comment: 'Wears noticeably smaller and thinner than other automatic chronographs. The dial legibility in low light with the Swiss Super-LumiNova is magnificent.',
        date: '2026-08-05',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z'
  },
  {
    id: 'prod-merino-coat',
    name: 'Komorebi Tailored Merino Wool Coat',
    slug: 'komorebi-tailored-merino-wool-coat',
    tagline: '100% heavyweight 620gsm virgin Merino wool with structured drape.',
    description: 'Cut from sustainably sourced virgin Australian Merino wool, the Komorebi Coat offers architectural drape with extraordinary thermal regulation and wind resistance. Finished with genuine horn buttons and cupro silk lining.',
    detailedDescription: 'The coat that defines cold-weather sophistication. Crafted in a family-owned sartorial atelier, the floating horsehair canvas chest piece ensures the lapel rolls naturally and adapts to your form over time. Features two interior welt pockets sized specifically for passports and modern smartphones.',
    price: 39999,
    compareAtPrice: 47999,
    category: 'Apparel & Wardrobe',
    categorySlug: 'apparel-wardrobe',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 18,
    rating: 4.9,
    reviewCount: 67,
    isFeatured: true,
    isNewArrival: true,
    tags: ['outerwear', 'merino wool', 'tailored', 'sustainable', 'autumn-winter'],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Camel Tan', hex: '#c29b71' },
        { name: 'Deep Navy', hex: '#1e293b' },
        { name: 'Charcoal Melange', hex: '#3f3f46' }
      ]
    },
    specs: [
      { label: 'Shell', value: '100% Virgin Merino Wool (620gsm)' },
      { label: 'Lining', value: '100% Japanese Bemberg Cupro' },
      { label: 'Buttons', value: 'Engraved Natural Buffalo Horn' },
      { label: 'Care', value: 'Specialty Dry Clean Only' }
    ],
    reviews: [
      {
        id: 'rev-4',
        authorName: 'Julian Chen',
        rating: 5,
        title: 'Perfect weight and modern silhouette',
        comment: 'Substantial weight that drapes effortlessly without feeling like an armored suit. Kept me warm in 25°F Chicago wind with just a knit sweater underneath.',
        date: '2026-08-20',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z'
  },
  {
    id: 'prod-machined-keyboard',
    name: 'Verve Custom Machined Aluminum Mechanical Keyboard',
    slug: 'verve-machined-aluminum-mechanical-keyboard',
    tagline: 'Gasket-mounted CNC anodized brass chassis with lubed linear switches.',
    description: 'The definitive typing experience. Engineered with a multi-layered poron acoustic dampening stack, hot-swappable PCB, and pre-lubricated custom linear switches on an anodized brass weight plate.',
    detailedDescription: 'Every keystroke delivers a deep, resonant, marbly acoustic profile. Featuring south-facing per-key RGB backlighting with diffuser bars, programmable rotary encoder for media scrub and volume, and seamless tri-mode connectivity (2.4GHz low latency, Bluetooth 5.2 multi-device, and braided USB-C).',
    price: 21999,
    compareAtPrice: 25999,
    category: 'Audio & Tech',
    categorySlug: 'audio-tech',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 15,
    rating: 5.0,
    reviewCount: 94,
    isFeatured: true,
    isNewArrival: false,
    tags: ['mechanical', 'gasket-mount', 'workspace', 'wireless', 'brass'],
    variants: {
      colors: [
        { name: 'Anodized Slate', hex: '#334155' },
        { name: 'Raw Silver', hex: '#cbd5e1' },
        { name: 'Forest Moss', hex: '#166534' }
      ]
    },
    specs: [
      { label: 'Layout', value: '75% Compact (84 keys + programmable knob)' },
      { label: 'Mounting Style', value: 'Double Gasket Mount with Poron Isolators' },
      { label: 'Switches', value: 'Factory-Lubed Lubed Aqua Linear 55g' },
      { label: 'Battery Life', value: 'Up to 240 hours without RGB' },
      { label: 'Weight', value: '1.82 kg (Solid Aluminum + Brass Weight)' }
    ],
    reviews: [
      {
        id: 'rev-5',
        authorName: 'Sarah Lin',
        rating: 5,
        title: 'Sounds like smooth raindrops on marble',
        comment: 'Out of the box, this feels like an expensive custom build that took weeks of modding. The knob is heavy aluminum and incredibly satisfying.',
        date: '2026-08-30',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z'
  },
  {
    id: 'prod-ceramic-pour-over',
    name: 'Kanso Handcrafted Ceramic Pour-Over & Kettle Set',
    slug: 'kanso-handcrafted-ceramic-pour-over-set',
    tagline: 'Artisanal stoneware dripper, double-walled carafe, and precision gooseneck kettle.',
    description: 'Transform your morning coffee into a sensory ritual. Crafted by generational ceramicists using mineral-rich coarse terracotta clay, paired with a temperature-controlled matte stainless steel gooseneck kettle.',
    detailedDescription: 'The geometric spiral ribs on the interior of the dripper facilitate optimal water saturation and degassing flow rate. The matching double-walled server preserves brewing temperatures for up to 45 minutes without reheating, protecting subtle floral and fruit tasting notes.',
    price: 12999,
    compareAtPrice: 15499,
    category: 'Minimalist Living',
    categorySlug: 'minimalist-living',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 35,
    rating: 4.7,
    reviewCount: 52,
    isFeatured: false,
    isNewArrival: true,
    tags: ['coffee', 'ceramics', 'slow living', 'kitchenware', 'handmade'],
    variants: {
      colors: [
        { name: 'Oatmeal Stoneware', hex: '#e7e5e4' },
        { name: 'Raw Terracotta', hex: '#9a3412' },
        { name: 'Basalt Black', hex: '#262626' }
      ]
    },
    specs: [
      { label: 'Carafe Capacity', value: '750ml (serves 1–3 cups)' },
      { label: 'Material', value: 'High-fire ceramic stoneware & 304 Stainless Steel' },
      { label: 'Filter Compatibility', value: 'Standard Cone 02 or Kalita Wave 185' },
      { label: 'Dishwasher Safe', value: 'Yes (Ceramic components)' }
    ],
    reviews: [
      {
        id: 'rev-6',
        authorName: 'Liam O’Connor',
        rating: 5,
        title: 'Elevated my morning completely',
        comment: 'Not only does it brew an exceptionally clean cup with zero bitterness, it looks like a sculpture on my countertop.',
        date: '2026-09-02',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    id: 'prod-french-linen-shirt',
    name: 'Atelier Relaxed French Linen Shirt',
    slug: 'atelier-relaxed-french-linen-shirt',
    tagline: 'Pre-washed Normandy flax with mother-of-pearl buttons.',
    description: 'Spun from sustainably harvested certified French flax, this relaxed button-down is garment-washed for broken-in softness from day one. Naturally breathable, hypoallergenic, and designed for effortless layering.',
    detailedDescription: 'Tailored with a soft camp collar and a curved split hem, the Atelier shirt strikes the balance between nonchalant resort elegance and crisp metropolitan dress. Features single-needle stitching throughout and reinforced seam gussets.',
    price: 9999,
    compareAtPrice: 12499,
    category: 'Apparel & Wardrobe',
    categorySlug: 'apparel-wardrobe',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 40,
    rating: 4.8,
    reviewCount: 78,
    isFeatured: false,
    isNewArrival: false,
    tags: ['linen', 'breathable', 'casual', 'organic', 'summer'],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Natural Sand', hex: '#f5f5f4' },
        { name: 'Aegean Blue', hex: '#0284c7' },
        { name: 'Olive Drab', hex: '#4d7c0f' }
      ]
    },
    specs: [
      { label: 'Material', value: '100% Normandy Certified Long-Staple Linen' },
      { label: 'Buttons', value: 'Genuine Trocas Mother of Pearl' },
      { label: 'Collar Style', value: 'Camp Collar / Reversible' },
      { label: 'Care', value: 'Machine Wash Cold, Hang Dry' }
    ],
    reviews: [
      {
        id: 'rev-7',
        authorName: 'Alex Rivera',
        rating: 5,
        title: 'The holy grail linen shirt',
        comment: 'Has that effortless, soft drape without feeling scratchy like cheaper linen. Gets softer with every single wash.',
        date: '2026-07-18',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-09-05T00:00:00.000Z'
  },
  {
    id: 'prod-leather-duffel',
    name: 'Lugano Full-Grain Leather Weekender Duffel',
    slug: 'lugano-full-grain-leather-weekender-duffel',
    tagline: 'Vegetable-tanned Tuscan vachetta leather with solid brass YKK Excella hardware.',
    description: 'Hand-burnished in Santa Croce sull’Arno, Italy. The Lugano Duffel is built to accompany you for decades of travel, developing a rich amber patina that tells the story of every journey.',
    detailedDescription: 'Includes an insulated separate shoe compartment lined in antimicrobial nylon, a padded 16” laptop compartment with magnetic closure, and a removable padded ergonomic shoulder strap. Fits comfortably in domestic and international airline overhead bins.',
    price: 42999,
    compareAtPrice: 48999,
    category: 'Fine Accessories',
    categorySlug: 'fine-accessories',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 9,
    rating: 4.9,
    reviewCount: 63,
    isFeatured: true,
    isNewArrival: false,
    tags: ['leather', 'travel', 'duffel', 'italian leather', 'heirloom'],
    variants: {
      colors: [
        { name: 'Cognac Tan', hex: '#b45309' },
        { name: 'Espresso Black', hex: '#1c1917' }
      ]
    },
    specs: [
      { label: 'Leather', value: 'Full-Grain Tuscan Vegetable-Tanned Cowhide' },
      { label: 'Dimensions', value: '52cm x 30cm x 26cm (40 Liters)' },
      { label: 'Hardware', value: 'Solid Japanese Brass Hardware with YKK Excella Zippers' },
      { label: 'Laptop Sleeve', value: 'Fits up to 16” MacBook Pro' }
    ],
    reviews: [
      {
        id: 'rev-8',
        authorName: 'Sebastian Cole',
        rating: 5,
        title: 'The compliments never stop',
        comment: 'Smells like authentic high-end leather the second you unbox it. The shoe compartment keeps everything neatly separated and clean.',
        date: '2026-08-11',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-09-08T00:00:00.000Z'
  },
  {
    id: 'prod-halo-lamp',
    name: 'Halo Nordic Dimmable Ambient Table Lamp',
    slug: 'halo-nordic-dimmable-ambient-table-lamp',
    tagline: 'Mouth-blown opal glass orb resting in a solid travertine marble pedestal.',
    description: 'A striking interplay of geometric form and atmospheric illumination. Emits a soothing 2200K–2700K warm incandescent glow via stepless capacitive touch dimming.',
    detailedDescription: 'The porous natural travertine stone base is individually cut and sealed, ensuring no two lamps have the exact same vein pattern. Powered by an internal rechargeable 5000mAh battery for 20 hours of cord-free placement or permanent USB-C tabletop power.',
    price: 16999,
    compareAtPrice: 19999,
    category: 'Minimalist Living',
    categorySlug: 'minimalist-living',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 22,
    rating: 4.8,
    reviewCount: 41,
    isFeatured: false,
    isNewArrival: true,
    tags: ['lighting', 'travertine', 'minimalist', 'cordless', 'decor'],
    variants: {
      colors: [
        { name: 'Beige Travertine', hex: '#e7e5e4' },
        { name: 'Nero Marquina Black', hex: '#262626' }
      ]
    },
    specs: [
      { label: 'Color Temperature', value: '2200K - 2700K Stepless Dimming (CRI > 95)' },
      { label: 'Battery Capacity', value: '5,000 mAh (14–22 hrs runtime)' },
      { label: 'Charging', value: 'USB-C Fast Charging (3.5 hrs to 100%)' },
      { label: 'Dimensions', value: 'Height 24cm, Diameter 18cm' }
    ],
    reviews: [
      {
        id: 'rev-9',
        authorName: 'Clara Oswald',
        rating: 5,
        title: 'Pure architectural poetry',
        comment: 'The soft glow transforms our living room every evening. Cordless freedom means we can move it out to the patio for dinner parties too.',
        date: '2026-08-25',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-05-18T00:00:00.000Z',
    updatedAt: '2026-09-16T00:00:00.000Z'
  },
  {
    id: 'prod-carbon-monitors',
    name: 'Monolith Carbon Desktop Studio Monitors (Pair)',
    slug: 'monolith-carbon-desktop-studio-monitors',
    tagline: 'Custom carbon fiber woofers with bi-amped Class-D amplification and optical inputs.',
    description: 'Pristine acoustic reproduction for discerning music producers and home offices. Delivers flat studio-reference frequency response with tight, fast low-end transient response.',
    detailedDescription: 'Featuring 4.5-inch woven carbon fiber woofers paired with 1-inch silk dome tweeters, driven by 120W of dedicated digital amplification. Features Bluetooth 5.0 with aptX HD, RCA analog line inputs, and optical digital TOSLINK.',
    price: 36999,
    compareAtPrice: 42999,
    category: 'Audio & Tech',
    categorySlug: 'audio-tech',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 8,
    rating: 4.9,
    reviewCount: 38,
    isFeatured: false,
    isNewArrival: false,
    tags: ['audio', 'monitors', 'studio', 'speakers', 'hifi'],
    variants: {
      colors: [
        { name: 'Matte Carbon Black', hex: '#171717' },
        { name: 'Oiled Walnut Wood', hex: '#451a03' }
      ]
    },
    specs: [
      { label: 'Amplifier Power', value: '120W Peak (60W RMS total bi-amped)' },
      { label: 'Drivers', value: '4.5" Woven Carbon Fiber + 1" Silk Dome' },
      { label: 'Frequency Range', value: '48Hz – 22,000Hz' },
      { label: 'Inputs', value: 'Optical, 3.5mm AUX, RCA Stereo, Bluetooth 5.0' }
    ],
    reviews: [
      {
        id: 'rev-10',
        authorName: 'Kenji Sato',
        rating: 5,
        title: 'Unbelievable detail and imaging',
        comment: 'Replaced a pair of bulky studio monitors. These take up half the footprint while delivering cleaner vocal separation and faster bass.',
        date: '2026-08-01',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-09-02T00:00:00.000Z'
  },
  {
    id: 'prod-santal-candle',
    name: 'Santal & Hinoki Botanical Wax Candle (300g)',
    slug: 'santal-hinoki-botanical-wax-candle',
    tagline: 'Hand-poured coconut apricot wax with smoked Australian sandalwood and cedarwood.',
    description: 'Slow-burning sensory warmth. Infused with natural essential oils of aged sandalwood, Japanese hinoki cypress, cardamom spice, and Tuscan orris root.',
    detailedDescription: 'Poured in a matte charcoal refractory vessel that can be repurposed as a succulent planter or desk pen cup after the candle burns down. Clean burning wood wick creates a subtle soothing campfire crackle.',
    price: 4499,
    compareAtPrice: 5499,
    category: 'Minimalist Living',
    categorySlug: 'minimalist-living',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572726729437-3732efed3f8a?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 50,
    rating: 4.8,
    reviewCount: 110,
    isFeatured: false,
    isNewArrival: false,
    tags: ['candle', 'fragrance', 'home', 'wood wick', 'aromatherapy'],
    specs: [
      { label: 'Wax Composition', value: '100% Biodegradable Coconut & Apricot Blend' },
      { label: 'Burn Time', value: 'Approximately 75+ hours' },
      { label: 'Wick', value: 'FSC-Certified Organic Crackling Wood Wick' },
      { label: 'Vessel', value: 'Rechargeable Matte Ceramic Urn' }
    ],
    reviews: [
      {
        id: 'rev-11',
        authorName: 'Chloe Bennett',
        rating: 5,
        title: 'Signature scent of our home now',
        comment: 'Not sickeningly sweet like commercial candles. Grounding, rich, and fills our entire open-concept kitchen without being overpowering.',
        date: '2026-09-10',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-09-18T00:00:00.000Z'
  },
  {
    id: 'prod-cashmere-scarf',
    name: 'Kyoto Brushed Mongolian Cashmere Scarf',
    slug: 'kyoto-brushed-mongolian-cashmere-scarf',
    tagline: 'Grade-A 100% organic long-fiber cashmere with ripple water finish.',
    description: 'Woven on traditional wooden shuttle looms in northern Italy using combed pure Mongolian cashmere fibers. Impossibly soft against the neck with generous dimensions for versatile styling.',
    detailedDescription: 'Treated with a natural thistle teasel ripple process that raises the fibers to a shimmering cloud-like luster. Finished with delicate hand-twisted fringe details.',
    price: 14999,
    compareAtPrice: 17999,
    category: 'Apparel & Wardrobe',
    categorySlug: 'apparel-wardrobe',
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 25,
    rating: 4.9,
    reviewCount: 45,
    isFeatured: false,
    isNewArrival: true,
    tags: ['cashmere', 'scarf', 'winter', 'accessories', 'luxury'],
    variants: {
      colors: [
        { name: 'Heather Charcoal', hex: '#52525b' },
        { name: 'Oatmeal Taupe', hex: '#d6d3d1' },
        { name: 'Bordeaux Plum', hex: '#831843' }
      ]
    },
    specs: [
      { label: 'Fiber Grade', value: 'Grade-A 15.2 Micron Pure Mongolian Cashmere' },
      { label: 'Dimensions', value: '190cm x 45cm (including fringe)' },
      { label: 'Origin', value: 'Woven in Biella, Italy' },
      { label: 'Care', value: 'Hand wash cool with wool wash or dry clean' }
    ],
    reviews: [
      {
        id: 'rev-12',
        authorName: 'Hannah Weber',
        rating: 5,
        title: 'Feels like wearing a warm cloud',
        comment: 'Zero itchiness, absolutely featherlight yet keeps the frigid morning wind out. Beautiful gift packaging as well.',
        date: '2026-08-19',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z'
  },
  {
    id: 'prod-titanium-sunglasses',
    name: 'Veloce Ultralight Titanium Polarized Sunglasses',
    slug: 'veloce-ultralight-titanium-polarized-sunglasses',
    tagline: 'Japanese aerospace titanium wireframe with Zeiss polarized antireflective lenses.',
    description: 'Weighing just 16 grams, the Veloce sunglasses combine featherweight resilience with distortion-free optical clarity. Custom screwless hinge mechanism engineered to withstand over 20,000 cycles.',
    detailedDescription: 'Featuring Carl Zeiss CR-39 polarized lenses with anti-reflective hydrophobic and oleophobic internal coatings. Ceramic hypoallergenic nose pads ensure seamless comfort throughout all-day wear.',
    price: 21499,
    compareAtPrice: 24999,
    category: 'Fine Accessories',
    categorySlug: 'fine-accessories',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80'
    ],
    stock: 19,
    rating: 4.8,
    reviewCount: 36,
    isFeatured: false,
    isNewArrival: false,
    tags: ['eyewear', 'titanium', 'polarized', 'ultralight', 'summer'],
    variants: {
      colors: [
        { name: 'Brushed Gunmetal', hex: '#475569' },
        { name: 'Matte Gold', hex: '#d97706' },
        { name: 'PVD Obsidian', hex: '#0f172a' }
      ]
    },
    specs: [
      { label: 'Frame Material', value: '100% Pure Japanese Beta-Titanium' },
      { label: 'Lenses', value: 'Zeiss Polarized Polycarbonate (UV400 Category 3)' },
      { label: 'Total Weight', value: '16.4 grams' },
      { label: 'Case Included', value: 'Foldable magnetic leather travel case' }
    ],
    reviews: [
      {
        id: 'rev-13',
        authorName: 'Derrick Hall',
        rating: 5,
        title: 'You literally forget you have them on',
        comment: 'No nose fatigue even after 6-hour road trips. The lenses cut road glare completely with zero color distortion.',
        date: '2026-08-08',
        verifiedPurchase: true
      }
    ],
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z'
  }
];

const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'Alexander Cross',
    email: 'admin@aura.store',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98201 44520',
    addresses: [
      {
        id: 'addr-admin-1',
        title: 'HQ Studio',
        recipientName: 'Alexander Cross',
        street: '420 Nariman Point, Marine Drive, Suite 18B',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400021',
        country: 'India',
        phone: '+91 98201 44520',
        isDefault: true
      }
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-customer-1',
    name: 'Alex Morgan',
    email: 'customer@aura.store',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98201 39281',
    addresses: [
      {
        id: 'addr-cust-1',
        title: 'Home Residence',
        recipientName: 'Alex Morgan',
        street: 'Flat 1204, Altamount Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400026',
        country: 'India',
        phone: '+91 98201 39281',
        isDefault: true
      },
      {
        id: 'addr-cust-2',
        title: 'Design Studio',
        recipientName: 'Alex Morgan',
        street: 'Indiranagar 100ft Road, Studio 3',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
        country: 'India',
        phone: '+91 98201 39281',
        isDefault: false
      }
    ],
    createdAt: '2026-02-10T00:00:00.000Z'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ORD-2026-9281',
    userId: 'user-customer-1',
    customerName: 'Alex Morgan',
    customerEmail: 'customer@aura.store',
    items: [
      {
        productId: 'prod-aura-pro-headphones',
        productName: 'AURA Pro Active Noise-Cancelling Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        price: 29999,
        quantity: 1,
        color: 'Matte Obsidian'
      },
      {
        productId: 'prod-santal-candle',
        productName: 'Santal & Hinoki Botanical Wax Candle (300g)',
        productImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
        price: 4499,
        quantity: 2
      }
    ],
    subtotal: 38997,
    discount: 3899.7,
    discountCode: 'WELCOME10',
    shippingFee: 0,
    tax: 6317.51,
    total: 41414.81,
    shippingAddress: {
      id: 'addr-cust-1',
      title: 'Home Residence',
      recipientName: 'Elena Vance',
      street: 'Flat 1204, Altamount Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400026',
      country: 'India',
      phone: '+91 98201 39281'
    },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_test_3N82b8a09281',
    orderStatus: 'delivered',
    trackingNumber: '1Z9999999999999999',
    statusHistory: [
      { status: 'pending', timestamp: '2026-08-20T14:30:00.000Z', note: 'Order placed by customer via Stripe.' },
      { status: 'confirmed', timestamp: '2026-08-20T14:32:00.000Z', note: 'Payment verified and inventory allocated.' },
      { status: 'processing', timestamp: '2026-08-21T09:00:00.000Z', note: 'Packed at distribution hub in Seattle, WA.' },
      { status: 'shipped', timestamp: '2026-08-21T16:45:00.000Z', note: 'Handed to UPS Ground with tracking 1Z9999999999999999.' },
      { status: 'delivered', timestamp: '2026-08-23T11:20:00.000Z', note: 'Delivered to front door / concierge.' }
    ],
    createdAt: '2026-08-20T14:30:00.000Z',
    updatedAt: '2026-08-23T11:20:00.000Z'
  },
  {
    id: 'ORD-2026-9540',
    userId: 'user-customer-1',
    customerName: 'Alex Morgan',
    customerEmail: 'customer@aura.store',
    items: [
      {
        productId: 'prod-machined-keyboard',
        productName: 'Verve Custom Machined Aluminum Mechanical Keyboard',
        productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
        price: 21999,
        quantity: 1,
        color: 'Anodized Slate'
      }
    ],
    subtotal: 21999,
    discount: 0,
    shippingFee: 0,
    tax: 3959.82,
    total: 25958.82,
    shippingAddress: {
      id: 'addr-cust-1',
      title: 'Home Residence',
      recipientName: 'Elena Vance',
      street: 'Flat 1204, Altamount Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400026',
      country: 'India',
      phone: '+91 98201 39281'
    },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_test_954018281',
    orderStatus: 'shipped',
    trackingNumber: '1Z8888888888888888',
    statusHistory: [
      { status: 'pending', timestamp: '2026-09-18T10:00:00.000Z', note: 'Order placed by customer.' },
      { status: 'confirmed', timestamp: '2026-09-18T10:05:00.000Z', note: 'Payment verified.' },
      { status: 'processing', timestamp: '2026-09-19T08:00:00.000Z', note: 'Quality inspection passed.' },
      { status: 'shipped', timestamp: '2026-09-20T14:10:00.000Z', note: 'In transit via Express Courier.' }
    ],
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-20T14:10:00.000Z'
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'coup-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscountAmount: 3000,
    usageLimit: 500,
    usageCount: 42,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'coup-aura20',
    code: 'AURA20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 9999,
    maxDiscountAmount: 10000,
    usageLimit: 200,
    usageCount: 88,
    isActive: true,
    createdAt: '2026-02-15T00:00:00.000Z'
  },
  {
    id: 'coup-flat1000',
    code: 'FLAT1000',
    discountType: 'fixed',
    discountValue: 1000,
    minOrderAmount: 7999,
    usageLimit: 100,
    usageCount: 23,
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'coup-vip50',
    code: 'VIP50',
    discountType: 'percentage',
    discountValue: 50,
    minOrderAmount: 25000,
    maxDiscountAmount: 20000,
    usageLimit: 25,
    usageCount: 12,
    isActive: true,
    createdAt: '2026-05-10T00:00:00.000Z'
  }
];

const initialBanners: Banner[] = [
  {
    id: 'ban-hero-highlight',
    title: 'The Autumn Equinox Archive',
    subtitle: 'Tactile ceramics, precision mechanical horology, and natural French linen.',
    badge: 'Limited Edition Release',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Archive',
    ctaLink: 'shop',
    position: 'top-hero',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'ban-curated-showcase',
    title: 'Precision Craft & Horology',
    subtitle: 'Complimentary insured door-to-door courier delivery across India.',
    badge: 'Artisanal Standards',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Discover Fine Accessories',
    ctaLink: 'fine-accessories',
    position: 'middle-shop',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-08-15T00:00:00.000Z'
  }
];

const initialSiteSettings: SiteSettings = {
  general: {
    siteName: 'Aura Atelier',
    tagline: 'Modern Minimalist E-Commerce & Artisanal Goods',
    contactEmail: 'concierge@aura.store',
    contactPhone: '+91 98201 44520',
    businessAddress: '420 Nariman Point, Marine Drive, Suite 18B, Mumbai 400021, India',
    taxNumber: '27AAACA1234A1Z5'
  },
  store: {
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 4999,
    standardShippingFee: 199,
    expressShippingFee: 499,
    taxPercent: 18,
    lowStockThreshold: 10,
    allowCod: true,
    minOrderAmount: 500
  },
  social: {
    instagram: 'https://instagram.com/aura.atelier',
    facebook: 'https://facebook.com/aura.atelier',
    linkedin: 'https://linkedin.com/company/aura-atelier',
    youtube: 'https://youtube.com/@aura-atelier',
    twitter: 'https://twitter.com/aura_atelier'
  },
  theme: {
    primaryColor: '#18181b',
    accentColor: '#f59e0b',
    mode: 'light',
    buttonRadius: 'md'
  },
  navigation: [
    { id: 'nav-home', label: 'Home', link: 'home', type: 'page', isEnabled: true, order: 1 },
    { id: 'nav-shop', label: 'Shop All', link: 'shop', type: 'page', isEnabled: true, order: 2 },
    { id: 'nav-audio', label: 'Audio & Tech', link: 'audio-tech', type: 'category', isEnabled: true, order: 3 },
    { id: 'nav-apparel', label: 'Apparel', link: 'apparel-wardrobe', type: 'category', isEnabled: true, order: 4 },
    { id: 'nav-living', label: 'Living', link: 'minimalist-living', type: 'category', isEnabled: true, order: 5 },
    { id: 'nav-acc', label: 'Accessories', link: 'fine-accessories', type: 'category', isEnabled: true, order: 6 },
    { id: 'nav-about', label: 'Our Story', link: 'about', type: 'page', isEnabled: true, order: 7 }
  ],
  footer: {
    description: 'An independent design atelier producing tactile acoustic instruments, Swiss mechanical timepieces, and mindful home objects.',
    copyrightText: '© 2026 Aura Atelier Inc. All rights reserved. Crafted with precision.',
    customerServiceLinks: [
      { label: 'Concierge Care', link: 'contact' },
      { label: 'Shipping & Delivery', link: 'terms' },
      { label: 'Returns & Exchange', link: 'terms' },
      { label: 'Privacy Policy', link: 'privacy' }
    ],
    quickLinks: [
      { label: 'Audio & Acoustics', link: 'audio-tech' },
      { label: 'Linen & Apparel', link: 'apparel-wardrobe' },
      { label: 'Mechanical Watches', link: 'fine-accessories' },
      { label: 'Living & Ceramics', link: 'minimalist-living' }
    ]
  }
};

const initialHomepageContent: HomepageContent = {
  announcement: {
    isEnabled: true,
    text: 'Complimentary insured express delivery across India on all orders over ₹4,999',
    link: 'shop',
    badge: 'Limited Offer'
  },
  hero: {
    heading: 'Timeless Objects for the Discerning Minimalist',
    tagline: 'Precision acoustic instruments, mechanical horology, and natural textiles.',
    description: 'Every creation in our archive is produced in limited series, balancing utilitarian engineering with sculptural purity.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Archive',
    buttonLink: 'shop',
    secondaryButtonText: 'Read Our Story',
    secondaryButtonLink: 'about'
  },
  featuredSectionTitle: 'Curated Archive Highlights',
  featuredSectionSubtitle: 'Distinctive objects chosen for exceptional material integrity and acoustic performance.',
  newArrivalsTitle: 'New In Atelier',
  newArrivalsSubtitle: 'The latest seasonal editions crafted in limited numbered batches.',
  curatedCategorySlugs: ['audio-tech', 'fine-accessories', 'minimalist-living', 'apparel-wardrobe'],
  benefits: [
    {
      id: 'ben-1',
      title: 'Complimentary Courier',
      description: 'Insured temperature-controlled door-to-door transit across all Indian pin codes.',
      icon: 'truck'
    },
    {
      id: 'ben-2',
      title: '3-Year Master Warranty',
      description: 'Comprehensive acoustic and mechanical coverage with factory calibration.',
      icon: 'shield'
    },
    {
      id: 'ben-3',
      title: '30-Day Atelier Trial',
      description: 'Experience each creation in your space with effortless complimentary returns.',
      icon: 'refresh-cw'
    },
    {
      id: 'ben-4',
      title: 'Dedicated Concierge',
      description: 'Direct consultation with our master horologists and audio engineers.',
      icon: 'headphones'
    }
  ]
};

const initialActivityLogs: AdminActivityLog[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@aura.store',
    adminName: 'Alexander Cross',
    action: 'System Initialized',
    targetType: 'settings',
    targetId: 'site-config',
    details: 'AURA Atelier production management suite booted with INR currency & GST engine.',
    timestamp: '2026-09-22T08:00:00.000Z'
  },
  {
    id: 'log-2',
    adminEmail: 'admin@aura.store',
    adminName: 'Alexander Cross',
    action: 'Inventory Audit',
    targetType: 'inventory',
    targetId: 'prod-aura-pro-headphones',
    details: 'Stock verified at 24 units. Low stock alert threshold set to 10.',
    timestamp: '2026-09-22T08:30:00.000Z'
  }
];

const initialQuestions: ProductQuestion[] = [
  {
    id: 'q-1',
    productId: 'prod-aura-pro-headphones',
    authorName: 'Siddharth Rao',
    question: 'Does this come with a 3.5mm analog audio cable for zero latency studio monitoring?',
    answer: 'Yes, the AURA Pro includes both a custom braided 3.5mm oxygen-free copper cable and a USB-C lossless digital DAC cable in the luxury travel case.',
    answeredBy: 'AURA Atelier Audio Specialist',
    answeredAt: '2026-08-16T10:30:00.000Z',
    createdAt: '2026-08-15T14:20:00.000Z'
  },
  {
    id: 'q-2',
    productId: 'prod-aura-pro-headphones',
    authorName: 'Pooja Verma',
    question: 'What is the replacement and warranty policy if I need ear cushion replacements in the future?',
    answer: 'We provide a 2-Year Comprehensive Atelier Warranty. Magnetic replacement ear cushions in genuine lambskin or vegan protein leather can be ordered directly from customer care.',
    answeredBy: 'Customer Support Lead',
    answeredAt: '2026-08-20T11:00:00.000Z',
    createdAt: '2026-08-19T18:45:00.000Z'
  },
  {
    id: 'q-3',
    productId: 'prod-horizon-watch',
    authorName: 'Aditya Mehta',
    question: 'Is the movement automatic mechanical or quartz battery operated?',
    answer: 'The Horizon Chronograph features a true Swiss-engineered mechanical automatic caliber with 28,800 vibrations per hour and 42-hour power reserve. No batteries needed.',
    answeredBy: 'Master Horologist',
    answeredAt: '2026-07-28T09:15:00.000Z',
    createdAt: '2026-07-27T16:00:00.000Z'
  },
  {
    id: 'q-4',
    productId: 'prod-komorebi-coat',
    authorName: 'Rhea Kapoor',
    question: 'What is the recommended sizing for wearing over thick winter knitwear?',
    answer: 'The coat is designed with a relaxed, tailored drape. We recommend choosing your standard size for comfortable layering over heavy knits and blazers.',
    answeredBy: 'Textile Stylist',
    answeredAt: '2026-08-05T15:20:00.000Z',
    createdAt: '2026-08-04T12:10:00.000Z'
  }
];

const initialBrands: Brand[] = [
  {
    id: 'brand-aura',
    name: 'AURA Soundworks',
    slug: 'aura-soundworks',
    logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
    description: 'Precision acoustics, beryllium transducers, and bespoke wireless audio hardware.',
    isActive: true,
    productCount: 4
  },
  {
    id: 'brand-atelier-horology',
    name: 'Atelier Horology',
    slug: 'atelier-horology',
    logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    description: 'Swiss-calibrated mechanical chronographs in surgical 316L stainless steel.',
    isActive: true,
    productCount: 3
  },
  {
    id: 'brand-kanso',
    name: 'Studio Kanso',
    slug: 'studio-kanso',
    logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
    description: 'Minimalist stoneware, tactile ceramics, and Japanese ritual tea accoutrements.',
    isActive: true,
    productCount: 3
  },
  {
    id: 'brand-nordic',
    name: 'Nordic Pure',
    slug: 'nordic-pure',
    logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&q=80',
    description: 'Heavyweight organic French terry, raw selvedge denim, and combed Mongolian cashmere.',
    isActive: true,
    productCount: 4
  }
];

const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Shipping & Delivery',
    question: 'How fast is insured delivery and which carriers are used?',
    answer: 'All orders are dispatched via temperature-controlled Blue Dart Apex and DHL Express with insured tracking. Delivery takes 1-2 business days for metropolitan centers and 2-4 business days for all other Indian pin codes.'
  },
  {
    id: 'faq-2',
    category: 'Returns & Exchange',
    question: 'What is the 30-day Atelier trial and return process?',
    answer: 'We offer an unconditional 30-day complimentary return or replacement policy. You can request a return directly from your dashboard; our concierge will schedule a white-glove pickup from your doorstep.'
  },
  {
    id: 'faq-3',
    category: 'Warranty & Authenticity',
    question: 'How is authenticity guaranteed for mechanical chronographs and acoustics?',
    answer: 'Every AURA creation arrives with a serialized certificate of origin, individual calibration test sheet, and a tamper-evident NFC holographic seal registered in our atelier archive.'
  },
  {
    id: 'faq-4',
    category: 'Payments & GST',
    question: 'Can I claim GST input tax credit for business purchases?',
    answer: 'Yes. Enter your company GSTIN during checkout, and our system will automatically generate a GST-compliant tax invoice (Original for Recipient) with itemized CGST and SGST.'
  },
  {
    id: 'faq-5',
    category: 'Payments & Security',
    question: 'Which payment methods are supported and is Cash on Delivery available?',
    answer: 'We support all major Visa, Mastercard, RuPay cards, UPI, Net Banking, and zero-cost EMI through our secure Stripe & RBI-compliant gateway. Cash on Delivery (COD) is available on orders up to ₹25,000.'
  }
];

const initialSupportTickets: SupportTicket[] = [
  {
    id: 'TICK-901',
    userId: 'user-customer-1',
    customerName: 'Alex Morgan',
    customerEmail: 'customer@aura.store',
    orderId: 'ORD-2026-9281',
    category: 'delivery',
    subject: 'Request for scheduled Saturday morning delivery slot',
    priority: 'medium',
    status: 'in_progress',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Alex Morgan',
        message: 'Could you please confirm if the package can be delivered specifically between 10 AM and 1 PM this Saturday at my residence?',
        timestamp: '2026-09-22T10:14:00.000Z'
      },
      {
        id: 'msg-2',
        sender: 'support',
        senderName: 'AURA Concierge Team',
        message: 'Hello Alex, we have instructed Blue Dart Apex priority dispatch for your preferred Saturday 10 AM - 1 PM delivery window. The driver will contact your on-file number 30 minutes prior.',
        timestamp: '2026-09-22T11:02:00.000Z'
      }
    ],
    createdAt: '2026-09-22T10:14:00.000Z',
    updatedAt: '2026-09-22T11:02:00.000Z'
  }
];

class Database {
  private data: DatabaseSchema;
  private passwords: Map<string, string> = new Map([
    ['user-admin-1', 'Admin@Aura2026'],
    ['user-customer-1', 'Customer@2026']
  ]);

  constructor() {
    this.data = {
      users: initialUsers,
      products: initialProducts,
      categories: initialCategories,
      brands: initialBrands,
      orders: initialOrders,
      carts: {
        'user-customer-1': [
          { productId: 'prod-ceramic-pour-over', quantity: 1, selectedColor: 'Oatmeal Stoneware' }
        ]
      },
      wishlists: {
        'user-customer-1': ['prod-horizon-watch', 'prod-merino-coat']
      },
      coupons: initialCoupons,
      banners: initialBanners,
      siteSettings: initialSiteSettings,
      homepageContent: initialHomepageContent,
      adminActivityLogs: initialActivityLogs,
      questions: initialQuestions,
      returnRequests: [],
      supportTickets: initialSupportTickets,
      faqs: initialFAQs
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Check if database was saved with old USD prices (< 1000 for top item)
        const isOldUsd = parsed.products && parsed.products.length > 0 && parsed.products[0].price < 1000;
        this.data = {
          users: isOldUsd ? initialUsers : (parsed.users || initialUsers),
          products: isOldUsd ? initialProducts : (parsed.products && parsed.products.length > 0 ? parsed.products : initialProducts),
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : initialCategories,
          brands: parsed.brands && parsed.brands.length > 0 ? parsed.brands : initialBrands,
          orders: isOldUsd ? initialOrders : (parsed.orders || initialOrders),
          carts: parsed.carts || {},
          wishlists: parsed.wishlists || {},
          coupons: parsed.coupons && parsed.coupons.length > 0 ? parsed.coupons : initialCoupons,
          banners: parsed.banners && parsed.banners.length > 0 ? parsed.banners : initialBanners,
          siteSettings: parsed.siteSettings ? { ...initialSiteSettings, ...parsed.siteSettings } : initialSiteSettings,
          homepageContent: parsed.homepageContent ? { ...initialHomepageContent, ...parsed.homepageContent } : initialHomepageContent,
          adminActivityLogs: parsed.adminActivityLogs && parsed.adminActivityLogs.length > 0 ? parsed.adminActivityLogs : initialActivityLogs,
          questions: parsed.questions && parsed.questions.length > 0 ? parsed.questions : initialQuestions,
          returnRequests: parsed.returnRequests || [],
          supportTickets: parsed.supportTickets && parsed.supportTickets.length > 0 ? parsed.supportTickets : initialSupportTickets,
          faqs: parsed.faqs && parsed.faqs.length > 0 ? parsed.faqs : initialFAQs
        };
        // Normalize products and categories
        this.data.products.forEach(p => {
          if (p.isActive === undefined) p.isActive = true;
        });
        this.data.categories.forEach((c, idx) => {
          if (c.isActive === undefined) c.isActive = true;
          if (c.displayOrder === undefined) c.displayOrder = idx + 1;
        });
        this.save();
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not load database file, using in-memory state:', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save to database.json:', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(filter?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    inStockOnly?: boolean;
  }): Product[] {
    let result = [...this.data.products];

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter?.category && filter.category !== 'all') {
      const cat = filter.category;
      result = result.filter(
        p => p.categorySlug === cat || p.category.toLowerCase() === cat.toLowerCase()
      );
    }

    if (typeof filter?.minPrice === 'number' && !isNaN(filter.minPrice)) {
      result = result.filter(p => p.price >= filter.minPrice!);
    }

    if (typeof filter?.maxPrice === 'number' && !isNaN(filter.maxPrice)) {
      result = result.filter(p => p.price <= filter.maxPrice!);
    }

    if (typeof filter?.rating === 'number' && filter.rating > 0) {
      result = result.filter(p => p.rating >= filter.rating!);
    }

    if (filter?.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    switch (filter?.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  public createProduct(productData: Partial<Product>): Product {
    const slug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      id: 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: productData.name || 'New Product',
      slug: slug,
      tagline: productData.tagline || '',
      description: productData.description || '',
      detailedDescription: productData.detailedDescription || productData.description || '',
      price: Number(productData.price) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined,
      category: productData.category || 'General',
      categorySlug: productData.categorySlug || 'general',
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      stock: Number(productData.stock) || 0,
      rating: 5.0,
      reviewCount: 0,
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      tags: productData.tags || [],
      variants: productData.variants,
      specs: productData.specs || [],
      isActive: productData.isActive !== false,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.updateCategoryCounts();
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.products[idx];
    const updated: Product = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      compareAtPrice: updates.compareAtPrice !== undefined ? (updates.compareAtPrice ? Number(updates.compareAtPrice) : undefined) : existing.compareAtPrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : existing.isActive,
      updatedAt: new Date().toISOString()
    };
    this.data.products[idx] = updated;
    this.updateCategoryCounts();
    this.save();
    return updated;
  }

  public duplicateProduct(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;

    const newSlug = `${product.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    const cloned: Product = {
      ...product,
      id: 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: `${product.name} (Copy)`,
      slug: newSlug,
      stock: Math.max(0, product.stock),
      reviews: [],
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(cloned);
    this.updateCategoryCounts();
    this.save();
    return cloned;
  }

  public toggleProductActive(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    product.isActive = product.isActive === false ? true : false;
    product.updatedAt = new Date().toISOString();
    this.save();
    return product;
  }

  public updateStock(id: string, newStock: number): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    product.stock = Math.max(0, Number(newStock));
    product.updatedAt = new Date().toISOString();
    this.save();
    return product;
  }

  public adjustStock(id: string, delta: number): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    product.stock = Math.max(0, product.stock + Number(delta));
    product.updatedAt = new Date().toISOString();
    this.save();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < prevLen;
    if (deleted) {
      this.updateCategoryCounts();
      this.save();
    }
    return deleted;
  }

  public addProductReview(productId: string, review: { authorName: string; rating: number; title: string; comment: string }): Product | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    const newRev = {
      id: 'rev-' + Date.now().toString(36),
      authorName: review.authorName,
      rating: Number(review.rating),
      title: review.title,
      comment: review.comment,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true
    };
    product.reviews.unshift(newRev);
    product.reviewCount = product.reviews.length;
    const totalStars = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalStars / product.reviews.length).toFixed(1));
    this.save();
    return product;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    this.updateCategoryCounts();
    return this.data.categories.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }

  public getCategoryByIdOrSlug(idOrSlug: string): Category | undefined {
    return this.data.categories.find(c => c.id === idOrSlug || c.slug === idOrSlug);
  }

  public createCategory(data: Partial<Category>): Category {
    const slug = (data.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: data.name || 'New Category',
      slug: data.slug || slug,
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      productCount: 0,
      isActive: data.isActive !== false,
      displayOrder: data.displayOrder || this.data.categories.length + 1
    };
    this.data.categories.push(newCat);
    this.updateCategoryCounts();
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;

    const oldSlug = cat.slug;
    Object.assign(cat, updates);
    if (updates.slug && updates.slug !== oldSlug) {
      // update categorySlug on products
      this.data.products.forEach(p => {
        if (p.categorySlug === oldSlug) {
          p.categorySlug = updates.slug!;
          if (updates.name) p.category = updates.name;
        }
      });
    }
    this.updateCategoryCounts();
    this.save();
    return cat;
  }

  public deleteCategory(id: string): { success: boolean; error?: string } {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return { success: false, error: 'Category not found.' };

    const productsInCat = this.data.products.filter(p => p.categorySlug === cat.slug);
    if (productsInCat.length > 0) {
      return {
        success: false,
        error: `Cannot delete "${cat.name}" because ${productsInCat.length} product(s) are assigned to it. Please reassign or delete them first.`
      };
    }

    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return { success: true };
  }

  private updateCategoryCounts() {
    this.data.categories.forEach(cat => {
      cat.productCount = this.data.products.filter(
        p => p.categorySlug === cat.slug || p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
    });
  }

  // --- USERS & AUTH ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return undefined;
    return this.data.users.find(u => {
      if (!u.phone) return false;
      const pClean = u.phone.replace(/[^0-9]/g, '');
      return pClean.endsWith(clean.slice(-10)) || clean.endsWith(pClean.slice(-10));
    });
  }

  public findUserByIdentifier(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const trimmed = identifier.trim().toLowerCase();
    if (trimmed.includes('@')) {
      return this.findUserByEmail(trimmed);
    }
    return this.findUserByPhone(trimmed) || this.findUserByEmail(trimmed);
  }

  public setUserPassword(userId: string, pass: string): void {
    this.passwords.set(userId, pass);
  }

  public verifyUserPassword(userId: string, pass: string): boolean {
    const stored = this.passwords.get(userId);
    if (!stored) {
      return pass.length >= 6;
    }
    return stored === pass;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { name: string; email: string; role?: 'customer' | 'admin'; avatar?: string }): User {
    const newUser: User = {
      id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'customer',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public createAdminUser(userData: { name: string; email: string; phone?: string; password?: string; avatar?: string }): User {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const password = userData.password || '';
    const phoneInput = userData.phone?.trim();

    if (!normalizedEmail || !userData.name.trim()) {
      throw new Error('Admin name and email are required.');
    }

    if (this.findUserByEmail(normalizedEmail)) {
      throw new Error('An administrator with this email already exists.');
    }

    if (phoneInput) {
      const normalizedPhone = validateAndNormalizeIndianPhone(phoneInput);
      if (!normalizedPhone.valid) {
        throw new Error(normalizedPhone.error || 'Invalid Indian mobile number for admin account.');
      }
      if (this.findUserByPhone(normalizedPhone.e164)) {
        throw new Error('An administrator with this mobile number already exists.');
      }
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Admin password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one symbol.');
    }

    const user = this.createUser({
      name: userData.name.trim(),
      email: normalizedEmail,
      role: 'admin',
      avatar: userData.avatar
    });

    if (phoneInput) {
      const normalizedPhone = validateAndNormalizeIndianPhone(phoneInput);
      this.updateUser(user.id, { phone: normalizedPhone.e164, status: 'active' } as any);
    }

    this.setUserPassword(user.id, password);
    return this.findUserById(user.id) || user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  public addUserAddress(userId: string, address: Omit<Address, 'id'>): Address | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    const newAddr: Address = {
      ...address,
      id: 'addr-' + Date.now().toString(36)
    };
    if (newAddr.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    } else if (user.addresses.length === 0) {
      newAddr.isDefault = true;
    }
    user.addresses.push(newAddr);
    this.save();
    return newAddr;
  }

  public getAllCustomers(): { user: User; totalOrders: number; totalSpent: number; lastOrderDate?: string }[] {
    return this.data.users
      .filter(u => u.role === 'customer')
      .map(u => {
        const userOrders = this.data.orders.filter(o => o.userId === u.id);
        const spent = userOrders.reduce((sum, o) => sum + o.total, 0);
        const lastOrder = userOrders.length > 0
          ? [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          : undefined;
        return {
          user: u,
          totalOrders: userOrders.length,
          totalSpent: Number(spent.toFixed(2)),
          lastOrderDate: lastOrder?.createdAt
        };
      });
  }

  public updateCustomerStatus(userId: string, status: 'active' | 'suspended'): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.status = status;
    this.save();
    return user;
  }

  // --- CART & WISHLIST ---
  public getCart(userId: string) {
    const items = this.data.carts[userId] || [];
    return items
      .map(item => {
        const product = this.getProductById(item.productId);
        if (!product) return null;
        return {
          productId: item.productId,
          product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        };
      })
      .filter(Boolean);
  }

  public setCart(userId: string, items: { productId: string; quantity: number; selectedSize?: string; selectedColor?: string }[]) {
    this.data.carts[userId] = items.filter(i => i.quantity > 0);
    this.save();
    return this.getCart(userId);
  }

  public getWishlist(userId: string): Product[] {
    const productIds = this.data.wishlists[userId] || [];
    return productIds
      .map(id => this.getProductById(id))
      .filter(Boolean) as Product[];
  }

  public toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: Product[] } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }
    const list = this.data.wishlists[userId];
    const idx = list.indexOf(productId);
    let inWishlist = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      inWishlist = true;
    }
    this.save();
    return { inWishlist, wishlist: this.getWishlist(userId) };
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    // Validate inventory stock for all items
    for (const item of orderData.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) {
        throw new Error(`Product not found in archive: ${item.productName || item.productId}`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient inventory for "${prod.name}". Only ${prod.stock} unit(s) remaining.`);
      }
    }

    // Process coupon usage if applied
    if (orderData.discountCode) {
      const coupon = this.getCouponByCode(orderData.discountCode);
      if (coupon && coupon.isActive) {
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }

    // Generate order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      orderStatus: orderData.orderStatus || 'pending',
      status: orderData.status || orderData.orderStatus || 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: now,
          note: `Order received and confirmed via ${orderData.paymentMethod.toUpperCase()}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    // Deduct stock for items
    for (const item of newOrder.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    this.data.orders.unshift(newOrder);

    // Clear user cart if authenticated
    if (orderData.userId && this.data.carts[orderData.userId]) {
      this.data.carts[orderData.userId] = [];
    }

    this.save();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: Order['orderStatus'], note?: string, admin?: { email: string; name: string }): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const oldStatus = order.orderStatus;

    // Disallow invalid transition if already completed
    if (oldStatus === 'delivered' && (newStatus === 'pending' || newStatus === 'processing')) {
      throw new Error('Delivered orders cannot be reverted back to pending or processing.');
    }

    // If order is newly cancelled, restore inventory
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = this.getProductById(item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    }

    // If order is refunded, update payment status
    if (newStatus === 'refunded') {
      order.paymentStatus = 'refunded';
    }

    order.orderStatus = newStatus;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: order.updatedAt,
      note: note || `Status transitioned to ${newStatus.toUpperCase()}`
    });

    if ((newStatus === 'shipped' || newStatus === 'out_for_delivery' || newStatus === 'delivered') && !order.trackingNumber) {
      order.trackingNumber = 'BD-APEX-' + Math.floor(100000000 + Math.random() * 900000000);
    }

    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        `Order #${order.id} Updated`,
        'order',
        order.id,
        `Status changed from ${oldStatus} to ${newStatus}. Note: ${note || 'Standard workflow'}`
      );
    }

    return order;
  }

  // --- ADMIN ANALYTICS ---
  public getAdminStats(): AdminStats {
    const orders = this.data.orders;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing' || o.orderStatus === 'confirmed').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

    const totalProducts = this.data.products.length;
    const totalCustomers = this.data.users.filter(u => u.role === 'customer').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const lowStockThreshold = this.data.siteSettings?.store?.lowStockThreshold || 10;
    const lowStockProducts = this.data.products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold);
    const lowStockCount = lowStockProducts.length;
    const outOfStockCount = this.data.products.filter(p => p.stock === 0).length;
    const recentOrders = orders.slice(0, 8);
    const recentCustomers = this.getAllCustomers().slice(0, 6);

    // Group sales trend by last 7 dates or days
    const salesTrend = [
      { date: 'Mon', revenue: 84000, orders: 4 },
      { date: 'Tue', revenue: 142000, orders: 6 },
      { date: 'Wed', revenue: 118000, orders: 5 },
      { date: 'Thu', revenue: 195000, orders: 8 },
      { date: 'Fri', revenue: 268000, orders: 11 },
      { date: 'Sat', revenue: 345000, orders: 14 },
      { date: 'Sun', revenue: totalRevenue > 50000 ? Math.round(totalRevenue * 0.22) : 210000, orders: 9 }
    ];

    const salesByDay = salesTrend.map(s => ({ date: s.date, amount: s.revenue }));

    const categoryDistribution = this.data.categories.map(cat => {
      const prods = this.data.products.filter(p => p.categorySlug === cat.slug);
      const catRevenue = orders
        .flatMap(o => o.items)
        .filter(item => prods.some(p => p.id === item.productId))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        category: cat.name,
        count: prods.length,
        revenue: Math.round(catRevenue)
      };
    });

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      lowStockCount,
      outOfStockCount,
      lowStockProducts,
      recentOrders,
      recentCustomers,
      salesTrend,
      salesByDay,
      categoryDistribution
    };
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return [...this.data.coupons].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCouponById(id: string): Coupon | undefined {
    return this.data.coupons.find(c => c.id === id);
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(
      c => c.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
  }

  public createCoupon(data: Partial<Coupon>, admin?: { email: string; name: string }): Coupon {
    const code = (data.code || 'COUPON').trim().toUpperCase();
    const existing = this.getCouponByCode(code);
    if (existing) {
      throw new Error(`Coupon code "${code}" already exists.`);
    }

    const newCoupon: Coupon = {
      id: 'coup-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      code,
      discountType: data.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(data.discountValue) || 10,
      minOrderAmount: Number(data.minOrderAmount) || 0,
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
      expirationDate: data.expirationDate || undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usageCount: 0,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString()
    };

    this.data.coupons.unshift(newCoupon);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Created Coupon',
        'coupon',
        newCoupon.id,
        `Created coupon "${newCoupon.code}" with ${newCoupon.discountType === 'percentage' ? newCoupon.discountValue + '%' : '₹' + newCoupon.discountValue} discount.`
      );
    }

    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>, admin?: { email: string; name: string }): Coupon | null {
    const coupon = this.getCouponById(id);
    if (!coupon) return null;

    if (updates.code && updates.code.trim().toUpperCase() !== coupon.code) {
      const code = updates.code.trim().toUpperCase();
      const existing = this.getCouponByCode(code);
      if (existing && existing.id !== id) {
        throw new Error(`Coupon code "${code}" is already in use.`);
      }
      coupon.code = code;
    }

    if (updates.discountType !== undefined) coupon.discountType = updates.discountType;
    if (updates.discountValue !== undefined) coupon.discountValue = Number(updates.discountValue);
    if (updates.minOrderAmount !== undefined) coupon.minOrderAmount = Number(updates.minOrderAmount);
    if (updates.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = updates.maxDiscountAmount ? Number(updates.maxDiscountAmount) : undefined;
    if (updates.expirationDate !== undefined) coupon.expirationDate = updates.expirationDate || undefined;
    if (updates.usageLimit !== undefined) coupon.usageLimit = updates.usageLimit ? Number(updates.usageLimit) : undefined;
    if (updates.isActive !== undefined) coupon.isActive = Boolean(updates.isActive);

    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Updated Coupon',
        'coupon',
        coupon.id,
        `Updated settings for coupon "${coupon.code}".`
      );
    }

    return coupon;
  }

  public toggleCoupon(id: string, admin?: { email: string; name: string }): Coupon | null {
    const coupon = this.getCouponById(id);
    if (!coupon) return null;
    coupon.isActive = !coupon.isActive;
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        coupon.isActive ? 'Activated Coupon' : 'Deactivated Coupon',
        'coupon',
        coupon.id,
        `Coupon "${coupon.code}" is now ${coupon.isActive ? 'active' : 'inactive'}.`
      );
    }

    return coupon;
  }

  public deleteCoupon(id: string, admin?: { email: string; name: string }): boolean {
    const coupon = this.getCouponById(id);
    if (!coupon) return false;

    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Deleted Coupon',
        'coupon',
        id,
        `Deleted coupon "${coupon.code}".`
      );
    }

    return true;
  }

  // --- BANNERS ---
  public getBanners(activeOnly = false): Banner[] {
    let result = [...this.data.banners];
    if (activeOnly) {
      result = result.filter(b => b.isActive);
    }
    return result.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }

  public getBannerById(id: string): Banner | undefined {
    return this.data.banners.find(b => b.id === id);
  }

  public createBanner(data: Partial<Banner>, admin?: { email: string; name: string }): Banner {
    const newBanner: Banner = {
      id: 'ban-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      title: data.title || 'Promotional Banner',
      subtitle: data.subtitle || '',
      badge: data.badge || '',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      ctaText: data.ctaText || 'Shop Now',
      ctaLink: data.ctaLink || 'shop',
      position: data.position || 'top-hero',
      isActive: data.isActive !== false,
      displayOrder: data.displayOrder || this.data.banners.length + 1,
      bgGradient: data.bgGradient || undefined,
      createdAt: new Date().toISOString()
    };

    this.data.banners.push(newBanner);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Created Banner',
        'banner',
        newBanner.id,
        `Created banner "${newBanner.title}" at position ${newBanner.position}.`
      );
    }

    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>, admin?: { email: string; name: string }): Banner | null {
    const banner = this.getBannerById(id);
    if (!banner) return null;

    Object.assign(banner, updates);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Updated Banner',
        'banner',
        banner.id,
        `Updated banner "${banner.title}".`
      );
    }

    return banner;
  }

  public deleteBanner(id: string, admin?: { email: string; name: string }): boolean {
    const banner = this.getBannerById(id);
    if (!banner) return false;

    this.data.banners = this.data.banners.filter(b => b.id !== id);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Deleted Banner',
        'banner',
        id,
        `Removed banner "${banner.title}".`
      );
    }

    return true;
  }

  // --- SITE SETTINGS ---
  public getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  public updateSiteSettings(updates: Partial<SiteSettings>, admin?: { email: string; name: string }): SiteSettings {
    const current = this.data.siteSettings;
    this.data.siteSettings = {
      ...current,
      ...updates,
      general: { ...current.general, ...(updates.general || {}) },
      store: { ...current.store, ...(updates.store || {}) },
      social: { ...current.social, ...(updates.social || {}) },
      theme: { ...current.theme, ...(updates.theme || {}) },
      navigation: updates.navigation || current.navigation,
      footer: { ...current.footer, ...(updates.footer || {}) }
    } as SiteSettings;
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Updated Website Settings',
        'settings',
        'site-config',
        'Business policies, currency configs, or navigation layout saved.'
      );
    }

    return this.data.siteSettings;
  }

  // --- HOMEPAGE CONTENT ---
  public getHomepageContent(): HomepageContent {
    return this.data.homepageContent;
  }

  public updateHomepageContent(updates: Partial<HomepageContent>, admin?: { email: string; name: string }): HomepageContent {
    const current = this.data.homepageContent;
    this.data.homepageContent = {
      ...current,
      ...updates,
      announcement: {
        ...(current.announcement || { isEnabled: true, text: '', link: '', badge: '' }),
        ...(updates.announcement || {})
      },
      hero: {
        ...(current.hero || { heading: '', tagline: '', description: '', imageUrl: '', buttonText: '', buttonLink: '', secondaryButtonText: '', secondaryButtonLink: '' }),
        ...(updates.hero || {})
      },
      benefits: updates.benefits || current.benefits || [],
      curatedCategorySlugs: updates.curatedCategorySlugs || current.curatedCategorySlugs || []
    } as HomepageContent;
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Updated Homepage Content',
        'settings',
        'homepage-cms',
        'Hero banners, value propositions, or featured section headers modified.'
      );
    }

    return this.data.homepageContent;
  }

  // --- ADMIN ACTIVITY LOGS ---
  public getActivityLogs(limit = 100): AdminActivityLog[] {
    return [...this.data.adminActivityLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logActivity(
    adminEmail: string,
    adminName: string,
    action: string,
    targetType: AdminActivityLog['targetType'],
    targetId: string | undefined,
    details: string
  ): AdminActivityLog {
    const log: AdminActivityLog = {
      id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      adminEmail: adminEmail || 'admin@aura.store',
      adminName: adminName || 'Admin User',
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.adminActivityLogs.unshift(log);
    if (this.data.adminActivityLogs.length > 500) {
      this.data.adminActivityLogs = this.data.adminActivityLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  // --- QUESTIONS & ANSWERS ---
  public getProductQuestions(productId: string): ProductQuestion[] {
    return (this.data.questions || [])
      .filter(q => q.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllQuestions(): ProductQuestion[] {
    return [...(this.data.questions || [])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addProductQuestion(productId: string, data: { authorName: string; question: string }): ProductQuestion {
    if (!this.data.questions) this.data.questions = [];
    const newQuestion: ProductQuestion = {
      id: 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      productId,
      authorName: data.authorName || 'Verified Inquirer',
      question: data.question,
      createdAt: new Date().toISOString()
    };
    this.data.questions.unshift(newQuestion);
    this.save();
    return newQuestion;
  }

  public answerProductQuestion(questionId: string, answer: string, answeredBy: string = 'AURA Atelier Specialist'): ProductQuestion | null {
    if (!this.data.questions) this.data.questions = [];
    const q = this.data.questions.find(item => item.id === questionId);
    if (!q) return null;
    q.answer = answer;
    q.answeredBy = answeredBy;
    q.answeredAt = new Date().toISOString();
    this.save();
    return q;
  }

  // --- ORDER CANCELLATIONS & RETURNS ---
  public cancelOrder(orderId: string, reason?: string, user?: { id: string; email: string; name: string }): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    if (order.orderStatus === 'cancelled') return order;
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      throw new Error('This shipment has already been dispatched or delivered and cannot be cancelled directly. Please initiate a return request instead.');
    }

    order.cancellationReason = reason || 'Cancelled by customer';
    const updated = this.updateOrderStatus(
      orderId,
      'cancelled',
      `Order cancelled: ${order.cancellationReason}`,
      user ? { email: user.email, name: user.name } : undefined
    );
    return updated;
  }

  public requestOrderReturn(orderId: string, reason: string, comment?: string, user?: { id: string; email: string; name: string }): { order: Order; returnRequest: ReturnRequest } | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    if (!this.data.returnRequests) this.data.returnRequests = [];

    const newReq: ReturnRequest = {
      id: 'ret-' + Date.now().toString(36),
      orderId,
      userId: user?.id || order.userId,
      customerName: user?.name || order.customerName,
      customerEmail: user?.email || order.customerEmail,
      reason,
      comment,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.returnRequests.unshift(newReq);

    order.returnReason = reason;
    order.returnComment = comment;
    order.orderStatus = 'return_requested';
    order.status = 'return_requested';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'return_requested',
      timestamp: order.updatedAt,
      note: `Return requested: ${reason}. ${comment ? 'Notes: ' + comment : ''}`
    });

    this.save();
    return { order, returnRequest: newReq };
  }

  public getReturnRequests(): ReturnRequest[] {
    return this.data.returnRequests || [];
  }

  public updateReturnRequestStatus(requestId: string, status: ReturnRequest['status'], adminUser?: { email: string; name: string }): ReturnRequest | null {
    if (!this.data.returnRequests) this.data.returnRequests = [];
    const req = this.data.returnRequests.find(r => r.id === requestId);
    if (!req) return null;
    req.status = status;

    const order = this.getOrderById(req.orderId);
    if (order) {
      if (status === 'approved' || status === 'completed') {
        order.orderStatus = 'refunded';
        order.status = 'refunded';
        order.paymentStatus = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          timestamp: new Date().toISOString(),
          note: `Return approved & refunded by Atelier administration`
        });
      }
    }

    if (adminUser) {
      this.logActivity(
        adminUser.email,
        adminUser.name,
        `Return #${req.id} ${status.toUpperCase()}`,
        'order',
        req.orderId,
        `Return request for order #${req.orderId} updated to status: ${status}`
      );
    }

    this.save();
    return req;
  }

  // --- BRANDS MANAGEMENT ---
  public getBrands(activeOnly = false): Brand[] {
    let list = this.data.brands || [];
    if (activeOnly) {
      list = list.filter(b => b.isActive);
    }
    return list;
  }

  public getBrandById(id: string): Brand | undefined {
    return (this.data.brands || []).find(b => b.id === id);
  }

  public createBrand(data: Partial<Brand>, admin?: { email: string; name: string }): Brand {
    if (!this.data.brands) this.data.brands = [];
    const newBrand: Brand = {
      id: 'brand-' + Date.now().toString(36),
      name: data.name || 'New Brand',
      slug: data.slug || (data.name || 'brand').toLowerCase().replace(/\s+/g, '-'),
      logo: data.logo || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
      description: data.description || '',
      isActive: data.isActive !== false,
      productCount: 0
    };
    this.data.brands.push(newBrand);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Created Brand',
        'category',
        newBrand.id,
        `Created brand ${newBrand.name}`
      );
    }
    return newBrand;
  }

  public updateBrand(id: string, updates: Partial<Brand>, admin?: { email: string; name: string }): Brand | null {
    if (!this.data.brands) this.data.brands = [];
    const brand = this.data.brands.find(b => b.id === id);
    if (!brand) return null;

    if (updates.name !== undefined) brand.name = updates.name;
    if (updates.slug !== undefined) brand.slug = updates.slug;
    if (updates.logo !== undefined) brand.logo = updates.logo;
    if (updates.description !== undefined) brand.description = updates.description;
    if (updates.isActive !== undefined) brand.isActive = updates.isActive;

    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Updated Brand',
        'category',
        brand.id,
        `Updated brand ${brand.name}`
      );
    }
    return brand;
  }

  public deleteBrand(id: string, admin?: { email: string; name: string }): boolean {
    if (!this.data.brands) return false;
    const brand = this.data.brands.find(b => b.id === id);
    if (!brand) return false;

    this.data.brands = this.data.brands.filter(b => b.id !== id);
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Deleted Brand',
        'category',
        id,
        `Deleted brand ${brand.name}`
      );
    }
    return true;
  }

  // --- SUPPORT TICKETS & FAQS ---
  public getSupportTickets(userId?: string): SupportTicket[] {
    const list = this.data.supportTickets || [];
    if (userId) {
      return list.filter(t => t.userId === userId);
    }
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getSupportTicketById(id: string): SupportTicket | undefined {
    return (this.data.supportTickets || []).find(t => t.id === id);
  }

  public createSupportTicket(data: {
    userId: string;
    customerName: string;
    customerEmail: string;
    orderId?: string;
    category: SupportTicket['category'];
    subject: string;
    message: string;
    priority?: SupportTicket['priority'];
  }): SupportTicket {
    if (!this.data.supportTickets) this.data.supportTickets = [];
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      id: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderId: data.orderId,
      category: data.category || 'general',
      subject: data.subject,
      priority: data.priority || 'medium',
      status: 'open',
      messages: [
        {
          id: 'msg-' + Date.now().toString(36),
          sender: 'customer',
          senderName: data.customerName,
          message: data.message,
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.data.supportTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  public addTicketMessage(
    ticketId: string,
    message: { sender: 'customer' | 'support'; senderName: string; message: string },
    newStatus?: SupportTicket['status']
  ): SupportTicket | null {
    if (!this.data.supportTickets) this.data.supportTickets = [];
    const ticket = this.data.supportTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    const now = new Date().toISOString();
    ticket.messages.push({
      id: 'msg-' + Date.now().toString(36),
      sender: message.sender,
      senderName: message.senderName,
      message: message.message,
      timestamp: now
    });
    ticket.updatedAt = now;
    if (newStatus) {
      ticket.status = newStatus;
    } else if (message.sender === 'support' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    this.save();
    return ticket;
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status'], admin?: { email: string; name: string }): SupportTicket | null {
    if (!this.data.supportTickets) this.data.supportTickets = [];
    const ticket = this.data.supportTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        `Ticket #${ticket.id} ${status.toUpperCase()}`,
        'settings',
        ticket.id,
        `Support ticket status updated to ${status}`
      );
    }
    return ticket;
  }

  public getFAQs(): FAQItem[] {
    return this.data.faqs || [];
  }

  // --- REVIEWS MODERATION ---
  public getAllProductReviews(): { product: { id: string; name: string; image: string }; review: any }[] {
    const list: { product: { id: string; name: string; image: string }; review: any }[] = [];
    this.data.products.forEach(p => {
      (p.reviews || []).forEach(r => {
        list.push({
          product: {
            id: p.id,
            name: p.name,
            image: p.images[0] || ''
          },
          review: r
        });
      });
    });
    return list.sort((a, b) => new Date(b.review.date).getTime() - new Date(a.review.date).getTime());
  }

  public deleteProductReview(productId: string, reviewId: string, admin?: { email: string; name: string }): boolean {
    const prod = this.getProductById(productId);
    if (!prod || !prod.reviews) return false;

    const initialLen = prod.reviews.length;
    prod.reviews = prod.reviews.filter(r => r.id !== reviewId);
    if (prod.reviews.length === initialLen) return false;

    prod.reviewCount = prod.reviews.length;
    if (prod.reviews.length > 0) {
      const sum = prod.reviews.reduce((acc, r) => acc + r.rating, 0);
      prod.rating = Number((sum / prod.reviews.length).toFixed(1));
    }

    this.save();

    if (admin) {
      this.logActivity(
        admin.email,
        admin.name,
        'Moderated Review',
        'product',
        productId,
        `Removed review #${reviewId} on ${prod.name}`
      );
    }
    return true;
  }

  // --- CSV REPORTS GENERATION ---
  public generateReportsCsv(type: 'sales' | 'orders' | 'products' | 'customers'): string {
    if (type === 'orders') {
      const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Items Count', 'Subtotal', 'Discount', 'Tax', 'Total (INR)', 'Payment Status', 'Order Status'];
      const rows = this.data.orders.map(o => [
        o.id,
        o.createdAt,
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.customerEmail,
        o.items.length,
        o.subtotal,
        o.discount,
        o.tax,
        o.total,
        o.paymentStatus,
        o.orderStatus
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'products') {
      const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Price (INR)', 'Compare Price', 'Stock', 'Rating', 'Review Count', 'Status'];
      const rows = this.data.products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku || 'N/A',
        `"${p.category.replace(/"/g, '""')}"`,
        p.price,
        p.compareAtPrice || '',
        p.stock,
        p.rating,
        p.reviewCount,
        p.isActive !== false ? 'Active' : 'Archived'
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'customers') {
      const headers = ['Customer ID', 'Name', 'Email', 'Role', 'Addresses Count', 'Joined Date'];
      const rows = this.data.users.map(u => [
        u.id,
        `"${u.name.replace(/"/g, '""')}"`,
        u.email,
        u.role,
        u.addresses ? u.addresses.length : 0,
        u.createdAt
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Default: sales
    const headers = ['Date', 'Order ID', 'Gross Sales (INR)', 'Discounts', 'Taxes', 'Net Revenue', 'Status'];
    const rows = this.data.orders.map(o => [
      o.createdAt.split('T')[0],
      o.id,
      o.subtotal,
      o.discount,
      o.tax,
      o.total,
      o.orderStatus
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const db = new Database();
