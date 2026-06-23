export interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  details: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutUs {
  id: string;
  history: string;
  history_image: string | null;
  mission: string;
  vision: string;
  core_values: string;
  management: string;
  achievements: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  featured_image: string | null;
  content: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface ContactInfo {
  id: string;
  address: string;
  phone: string;
  email: string;
  emergency_phone: string;
  map_embed_url: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  site_name: string;
  site_logo_url: string | null;
  welcome_title: string;
  welcome_title_line2: string | null;
  welcome_text: string;
  hero_image_url: string | null;
  hero_cta_text: string;
  hero_cta_link: string;
  announcement_title: string | null;
  announcement_text: string | null;
  announcement_active: boolean;
  updated_at: string;
}

export interface TopBar {
  id: string;
  emergency_phone: string;
  working_hours: string;
  announcements: string[];
  marquee_speed: number;
  is_active: boolean;
  updated_at: string;
}
