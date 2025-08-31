import { z } from 'zod';

export const productSchema = z.object({
  type: z.enum(['physical', 'digital']),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0).nullable(),
  category_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  lead_time_days: z.number().int().min(0).nullable(),
  status: z.enum(['draft', 'active', 'paused', 'sold_out'])
});

export const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.number().min(0.01, 'Price must be greater than 0'),
  requires_brief: z.boolean().default(false),
  delivery_days: z.number().int().min(1, 'Delivery time must be at least 1 day'),
  category_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'active', 'paused'])
});

export const shopSchema = z.object({
  name: z.string().min(1, 'Shop name is required').max(100),
  slug: z.string().min(1, 'Shop URL is required').regex(/^[a-z0-9-]+$/, 'Invalid URL format'),
  bio: z.string().max(1000).optional(),
  country: z.string().optional(),
  policies: z.string().optional(),
  paypal_email: z.string().email().optional()
});

export const profileSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().optional()
});