export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  volume?: string | null; // e.g. "Vol-12" or "Vol: 1"
  description?: string | null;
  price?: number | null;
  price_visible: boolean;
  category_id?: string | null;
  category_name?: string | null;
  images: string[];
  in_stock: boolean;
  is_hidden: boolean;
  is_featured: boolean;
  is_locked: boolean;
  password_hash?: string | null;
  preview_image?: string | null;
  view_count: number;
  enquiry_count: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Sanitized Product view returned to public client prior to password unlock
export interface PublicProduct {
  id: string;
  name: string;
  volume?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  is_locked: boolean;
  in_stock: boolean;
  is_featured: boolean;
  preview_image?: string | null;
  // Included ONLY if is_locked === false or product is unlocked in current request
  images?: string[];
  price?: number | null;
  price_visible?: boolean;
  description?: string | null;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface EnquiryItem {
  product: Product | PublicProduct;
  quantity: number;
}

export interface PageView {
  id: string;
  page: string;
  visited_at: string;
}

export interface Enquiry {
  id: string;
  product_ids: string[];
  sent_at: string;
}

export interface AdminStats {
  totalProducts: number;
  hiddenProducts: number;
  lockedProducts: number;
  outOfStockProducts: number;
  totalVisits: number;
  totalEnquiries: number;
  topViewed: Product[];
  topEnquired: Product[];
}
