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

export interface Seller {
  id: number;
  name: string;
  type: 'shop' | 'individual' | 'service';
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  logo_url?: string;
  rating: number;
  verified: number;
  work_hours?: string;
  brands?: string;
  services?: string;
}

export interface ServiceCenter {
  id: number;
  name: string;
  services?: string;
  address?: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  work_hours?: string;
  brands?: string;
  rating: number;
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

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  city?: string;
  avatar_url?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  part_id: number;
  quantity: number;
  unit_price_uzs: number;
  status: string;
  part?: Part;
}

export interface Order {
  id: number;
  buyer_id: number;
  seller_id?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_uzs: number;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface Message {
  id: number;
  order_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  is_read: number;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  provider: 'payme' | 'click' | 'uzum' | 'cash_on_delivery';
  amount_uzs: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  provider_transaction_id?: string;
  payment_url?: string;
  created_at: string;
}
