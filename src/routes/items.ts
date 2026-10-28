import { Router } from 'express';
import { eq, and, ilike, or, asc, desc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { items } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { CreateItemSchema, UpdateItemSchema, QueryItemsSchema } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all items for the authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const parsed = QueryItemsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { search, searchType, type, category, sort } = parsed.data;
    const userId = req.userId!;

    const conditions: SQL[] = [eq(items.userId, userId)];

    // Apply search filter
    if (search) {
      const searchPattern = `%${search}%`;
      if (searchType === 'all') {
        const searchCond = or(
          ilike(items.name, searchPattern),
          ilike(items.location, searchPattern),
          ilike(items.notes, searchPattern)
        );
        if (searchCond) conditions.push(searchCond);
      } else if (searchType === 'name') {
        conditions.push(ilike(items.name, searchPattern));
      } else {
        conditions.push(ilike(items.location, searchPattern));
      }
    }

    // Apply type filter
    if (type) {
      conditions.push(eq(items.type, type));
    }

    // Apply category filter
    if (category) {
      conditions.push(eq(items.category, category));
    }

    // Apply sorting
    const [field, direction] = sort.split('-') as ['dateAdded' | 'name', 'asc' | 'desc'];
    const sortFn = direction === 'asc' ? asc : desc;
    const sortColumn = field === 'dateAdded' ? items.dateAdded : items.name;

    const result = await db.select().from(items).where(and(...conditions)).orderBy(sortFn(sortColumn));

    res.json(result);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single item by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.userId!;

    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new item
router.post('/', async (req: AuthRequest, res) => {
  try {
    const parsed = CreateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { name, type, location, category, notes, dateAdded } = parsed.data;
    const userId = req.userId!;

    const item = {
      id: crypto.randomUUID(),
      userId,
      name,
      type,
      location,
      category,
      notes,
      dateAdded: dateAdded ? new Date(dateAdded) : new Date(),
    };

    const result = await db.insert(items).values(item).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an item
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.userId!;

    const parsed = UpdateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    // Check ownership
    const existing = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updates: Record<string, any> = { ...parsed.data };
    if (updates.dateAdded) {
      updates.dateAdded = new Date(updates.dateAdded);
    }
    updates.updatedAt = new Date();

    const result = await db
      .update(items)
      .set(updates)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an item
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.userId!;

    const result = await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
