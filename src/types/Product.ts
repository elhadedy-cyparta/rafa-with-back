export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  original_price?: number; // For Django API compatibility
  image: string;
  images?: string[];
  additional_images?: string[]; // Raw field from API
  category: string;
  category_name?: string;
  categoryId?: string;
  rating: number;
  reviews: number;
  reviews_count?: number; // For Django API compatibility
  inStock: boolean;
  in_stock?: boolean; // For Django API compatibility
  isOffer?: boolean;
  is_offer?: boolean; // For Django API compatibility
  isBestSeller?: boolean;
  is_best_seller?: boolean; // For Django API compatibility
  features?: string[];
  colors?: string[];
  color?: Array<{
    id: number;
    hex_value: string;
    quantity: number;
    price: number;
    old_price?: number;
    images?: Array<{
      id: number;
      image: string;
    }>;
  }>; // Raw API color data with hex values
  brand?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  tags?: string[];
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color_id?: number;
  color_name?: string;
  color_hex?: string;
}