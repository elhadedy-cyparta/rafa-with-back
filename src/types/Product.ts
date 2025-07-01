export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  additional_images?: string[]; // Raw field from API
  category: string;
  categoryId?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isOffer?: boolean;
  isBestSeller?: boolean;
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

export interface CartItem extends Product {
  quantity: number;
}