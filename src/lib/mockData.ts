import { Product, Category, Banner } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-new-launch',
    name: 'New Launch',
    sort_order: 1,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  },
  {
    id: 'cat-cotton',
    name: 'Cotton',
    sort_order: 2,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  },
  {
    id: 'cat-rayon',
    name: 'Rayon',
    sort_order: 3,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  },
  {
    id: 'cat-jaam-cotton',
    name: 'Jaam Cotton',
    sort_order: 4,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  }
];

export const MOCK_BANNERS: Banner[] = [];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: '👉 GHOOMAR 👈 Vol 07 Rayon Cotton Suit Material',
    volume: 'Vol: 07',
    description: '👚 Top: RAYON COTTON PRINT Kat Dana , Dhagatikali combo WORK (2.50MTR)\r\n👖 Bottom: RAYON COTTON (2.50MTR)\r\n🧣 Dupatta: RAYON COTTON PRINT (2.25 MTR)\r\n📦 Packing: 8 Pcs Photo + Pauch + Bag (Billing Plus GST)\r\n\r\nCHETAK FASHION SURAT\r\n(Mfg. of Exclusive Cotton Dress Material Fabric)',
    price: 535,
    price_visible: true,
    category_id: 'cat-rayon',
    category_name: 'Rayon',
    images: [
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382420896-93dg3y.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382413893-p29iak.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382400860-2m7hw9.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382391712-oq2dfl.jpeg'
    ],
    in_stock: true,
    is_hidden: false,
    is_featured: true,
    is_locked: false,
    password_hash: null,
    preview_image: null,
    view_count: 1,
    enquiry_count: 0,
    sort_order: 1,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Chetak Soft Cotton Swarovski Diamond 💎 Suit Set',
    volume: 'Vol: 01',
    description: '👗 Top: Print Soft Cotton Best Quality Swarovski Diamond 💎 & Plain (2.50MTR)\r\n👖 Bottom: Soft Cotton (2.50MTR)\r\n🧣 Dupatta: Cotton Print (2.00 MTR)\r\n📦 Packing: 08 Pcs Pauch + Bag + Catalog (Billing Plus GST)\r\n\r\nCHETAK FASHION SURAT\r\n(Mfg. of Exclusive Cotton Dress Material Fabric)',
    price: 275,
    price_visible: true,
    category_id: 'cat-cotton',
    category_name: 'Cotton',
    images: [
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382128933-t3wqhx.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382118191-8qpcxw.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382111604-95xysr.jpeg',
      'https://shafiioaxfvtjfahumvv.supabase.co/storage/v1/object/public/product-images/products/1789382104716-upd2ou.jpeg'
    ],
    in_stock: true,
    is_hidden: false,
    is_featured: true,
    is_locked: false,
    password_hash: null,
    preview_image: null,
    view_count: 1,
    enquiry_count: 0,
    sort_order: 2,
    created_at: '2026-09-14T10:08:27.258829+00:00'
  }
];

export const MOCK_PAGE_VIEWS_COUNT = 0;
export const MOCK_ENQUIRIES_COUNT = 0;
