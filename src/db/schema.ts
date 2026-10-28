import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users table - stores registered users
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Items table - physical files/folders/boxes tracked by users
export const items = pgTable('items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // file, folder, box, binder, other
  location: text('location').notNull(),
  category: varchar('category', { length: 50 }), // Personal, Work, Financial, Medical, Legal, Education, Other
  notes: text('notes'),
  dateAdded: timestamp('date_added', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
