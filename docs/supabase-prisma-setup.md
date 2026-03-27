# Supabase + Prisma Setup

## Goal
- Manage schema changes from Prisma instead of writing SQL manually.
- Keep Supabase as the Postgres database and Storage provider.
- Let future changes such as adding fields, products, images, carts, or admin content be handled through Prisma schema + migrations.

## Environment
Copy `.env.example` to `.env` and fill in your project values from Supabase.

## Commands
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run prisma:studio`

## Workflow
1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Run `npm run prisma:seed` if sample data needs refreshing
4. App and admin changes can then use the new fields through Prisma Client

## Notes
- `DATABASE_URL` should use the Supabase pooled connection.
- `DIRECT_URL` should use the direct database connection for Prisma migrations.
- Product images can be uploaded to Supabase Storage later; schema already includes `storageBucket` and `storageFolder`.
- Rich content is stored in `descriptionHtml`, so admin can later use Tiptap or another rich text editor without changing the display route.
