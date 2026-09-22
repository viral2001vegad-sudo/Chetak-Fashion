export interface BusinessConfig {
  name: string;
  type: string;
  tagline: string;
  contactPerson: string;
  phone: string;
  rawPhone: string;
  whatsapp: string;
  address: string;
  gstin: string;
  instagram: string;
  googleMapsUrl: string;
  logoPath: string;
  instaformId?: string;
  facebookAdId?: string;
  facebookPageUrl?: string;
  reviewUrl?: string;
  hideAddress?: boolean;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
  };
}

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  name: "Chetak Fashion",
  type: "Textile / Saree / Dress Material Store",
  tagline: "Manufacturer of Exclusive Dress Material Collection",
  contactPerson: "Pratap Singh",
  phone: "+91 9724660535",
  rawPhone: "9724660535",
  whatsapp: "919724660535",
  address: "A-1001 To 1003 & 1034 To 1036, 1st Floor, Radha Raman Textile Mkt. (RRTM-1) Saroli, Surat-395010, Gujarat",
  gstin: "24FLAPS3668L1ZK",
  instagram: "https://instagram.com/chetakfashion",
  googleMapsUrl: "https://maps.google.com/?q=Radha+Raman+Textile+Market+Saroli+Surat",
  logoPath: "/logo.png",
  instaformId: "",
  facebookAdId: "",
  facebookPageUrl: "https://facebook.com/chetakfashion",
  reviewUrl: "https://g.page/r/chetakfashion/review",
  hideAddress: false,
  colors: {
    primary: "#98161E",
    primaryDark: "#7C151B",
    accent: "#D4AF37",
    background: "#FAFAFA",
  }
};

const STORAGE_KEY = 'chetak_business_config';

export function getBusinessConfig(): BusinessConfig {
  if (typeof window === 'undefined') return DEFAULT_BUSINESS_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_BUSINESS_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load business config from storage', e);
  }
  return DEFAULT_BUSINESS_CONFIG;
}

export function saveBusinessConfig(newConfig: Partial<BusinessConfig>): BusinessConfig {
  const current = getBusinessConfig();
  const updated = { ...current, ...newConfig };
  if (newConfig.phone && !newConfig.rawPhone) {
    updated.rawPhone = newConfig.phone.replace(/\D/g, '');
  }
  if (newConfig.whatsapp) {
    updated.whatsapp = newConfig.whatsapp.replace(/\D/g, '');
  }
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('business-settings-updated'));
    } catch (e) {
      console.error('Failed to save business config', e);
    }
  }
  return updated;
}

export const BUSINESS_CONFIG = DEFAULT_BUSINESS_CONFIG;
