# ArchiveX Backend Server

Express.js backend with Drizzle ORM for the ArchiveX physical file tracker app.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: Neon (PostgreSQL)
- **Auth**: JWT with bcrypt password hashing
- **Validation**: Zod

## Database Schema

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar(255) PK | UUID user ID |
| `email` | text (unique) | User email |
| `password_hash` | text | Bcrypt hashed password |
| `created_at` | timestamp | Account creation time |

### `items` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar(255) PK | UUID item ID |
| `user_id` | varchar(255) FK → users.id | Owner reference (cascade delete) |
| `name` | text | File/folder name |
| `type` | varchar(20) | file, folder, box, binder, other |
| `location` | text | Physical storage location |
| `category` | varchar(50) | Personal, Work, Financial, Medical, Legal, Education, Other |
| `notes` | text | Optional notes |
| `date_added` | timestamp | Date the item was cataloged |
| `created_at` | timestamp | Row creation time |
| `updated_at` | timestamp | Last update time |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

### Items (all require `Authorization: Bearer <token>`)
- `GET /api/items` — List all items (with search, filter, sort query params)
- `GET /api/items/:id` — Get a single item
- `POST /api/items` — Create a new item
- `PUT /api/items/:id` — Update an item
- `DELETE /api/items/:id` — Delete an item

### Query Parameters for `GET /api/items`
| Param | Values | Description |
|-------|--------|-------------|
| `search` | string | Search text |
| `searchType` | `all`, `name`, `location` | Search scope |
| `type` | `file`, `folder`, `box`, `binder`, `other` | Filter by type |
| `category` | `Personal`, `Work`, `Financial`, `Medical`, `Legal`, `Education`, `Other` | Filter by category |
| `sort` | `dateAdded-desc`, `dateAdded-asc`, `name-asc`, `name-desc` | Sort order |

### Health
- `GET /api/health` — Health check endpoint

## Setup Instructions

See the main README.md for full setup steps.
