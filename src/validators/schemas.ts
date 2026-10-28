import { z } from 'zod';

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Item schemas
const itemTypeEnum = z.enum(['file', 'folder', 'box', 'binder', 'other']);
const categoryEnum = z.enum(['Personal', 'Work', 'Financial', 'Medical', 'Legal', 'Education', 'Other']);

export const CreateItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: itemTypeEnum,
  location: z.string().min(1, 'Location is required').max(500),
  category: categoryEnum.optional().default('Other'),
  notes: z.string().max(2000).optional().default(''),
  dateAdded: z.string().datetime({ message: 'Invalid date format' }).optional(),
});

export const UpdateItemSchema = CreateItemSchema.partial();

// Query schemas
export const QueryItemsSchema = z.object({
  search: z.string().optional(),
  searchType: z.enum(['all', 'name', 'location']).optional().default('all'),
  type: itemTypeEnum.optional(),
  category: categoryEnum.optional(),
  sort: z.enum(['dateAdded-desc', 'dateAdded-asc', 'name-asc', 'name-desc']).optional().default('dateAdded-desc'),
});
