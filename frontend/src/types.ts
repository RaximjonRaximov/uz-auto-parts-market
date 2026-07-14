export interface Part {
  id: number;
  external_id?: string;
  title: string;
  description?: string;
  brand: string;
  model: string;
  year?: number;
  category: string;
  condition: 'new' | 'used' | 'remanufactured';
  price_uzs: number;
  price_usd?: number;
  currency: string;
  region?: string;
  city?: string;
  seller_name?: string;
  seller_phone?: string;
  image_url?: string;
  lat?: number;
  lon?: number;
  created_at: string;
  updated_at?: string;
}

export interface StatsSummary {
  total: number;
  avg_price_uzs?: number;
  categories: number;
  brands: number;
  cities: number;
}

export interface CityStat {
  city: string;
  region?: string;
  count: number;
  avg_price_uzs?: number;
  lat?: number;
  lon?: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  avg_price_uzs?: number;
}

export interface PriceBucket {
  min: number;
  max: number;
  count: number;
}

export interface Filters {
  q: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  min_year: string;
  max_year: string;
  min_price: string;
  max_price: string;
  region: string;
  city: string;
}
