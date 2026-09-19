export interface Category {
  id: string;
  name: string;
  image_url?: string | null;
  sort_order: number;
  created_at?: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  volume?: string | null; // e.g. "Vol-12" or "Vol: 1"
  brand_name?: string | null; // e.g. "GURBAT", "FIZA", "SAHIBA"
  top_fabric?: string | null; // e.g. "Cotton"
  bottom_fabric?: string | null; // e.g. "Cotton"
  dupatta_fabric?: string | null; // e.g. "Cotton" / "Nazneen"
  custom_fields?: CustomField[] | Record<string, string> | null;
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
  youtube_url?: string | null;
  pdf_url?: string | null;
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
  brand_name?: string | null;
  top_fabric?: string | null;
  bottom_fabric?: string | null;
  dupatta_fabric?: string | null;
  custom_fields?: CustomField[] | Record<string, string> | null;
  category_id?: string | null;
  category_name?: string | null;
  is_locked: boolean;
  in_stock: boolean;
  is_featured: boolean;
  preview_image?: string | null;
  youtube_url?: string | null;
  pdf_url?: string | null;
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

export interface TutorialVideo {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  category?: string | null;
  action_text?: string | null;
  action_url?: string | null;
  sort_order: number;
  created_at?: string;
}
