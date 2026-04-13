export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  categoryId: string;
  rating?: number;
  reviewsCount?: number;
  inStock: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  image?: string;
  productCount?: number;
  subcategories?: Category[];
  children?: Category[]
}

export interface Blog {
  id: string;
  slug?: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  image: string;
  author: string;
  authorEn?: string;
  publishedAt: string;
  category: string;
  categoryEn?: string;
  readTime?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  company?: string;
  companyEn?: string;
  content: string;
  contentEn?: string;
  avatar: string;
  rating: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'fa' | 'en';
export type Direction = 'ltr' | 'rtl';

/**
 * Shop settings structure
 */
export interface ShopSettings {
  Shop_Name?: string;
  Shop_Favicon?: string;
  Shop_Logo_Desktop?: string;
  Shop_Logo_Mobile?: string;
  [key: string]: unknown;
}

/**
 * Login settings structure
 */
export interface LoginSettings {
  Login_PageTitle?: string;
  Login_SubHeader?: string;
  Login_BackgroundUrl?: string;
  Login_ShowTermsLink?: boolean;
  Login_PrimaryColor?: string;
  Login_AllowRegistration?: boolean;
  Login_EnableForgotPassword?: boolean;
  Login_LayoutMode?: string;
  Login_ShowHeader?: boolean;
  Login_ShowFooter?: boolean;
  Login_BackgroundType?: string;
  Login_SplitImageWidth?: string;
  Login_AllowedMethods?: string;
  Login_EnableCaptcha?: boolean;
  Auth_GoogleClientId?: string;
  Auth_EnableGoogle?: boolean;
  [key: string]: unknown;
}

