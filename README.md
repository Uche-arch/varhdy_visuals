# Videographer portfolio

Next.js (App Router) + TypeScript + Tailwind, MongoDB Atlas for text, Cloudinary for files.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - `MONGODB_URI`: your Atlas connection string
   - `ADMIN_EMAIL`: the one email allowed to sign in
   - `ADMIN_PASSWORD_HASH_B64`: run `node scripts/hash-password.mjs "a-long-password"` and paste the output
   - `SESSION_SECRET`: run `openssl rand -base64 48`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. `npm run dev`
4. Open `/admin`, sign in, and use **Add** to upload.

Edit `lib/site.ts` for his name, headline, email and social links.

## Limits

Set in `lib/constants.ts`: videos up to 200MB, pictures up to 15MB each, up to 4 pictures per post, captions up to 300 characters. Your Cloudinary plan has its own file size limit, which may be lower.

## How the admin is protected

- One admin from env variables. No signup route, no user table.
- Password stored as a bcrypt hash. Login is limited to 5 attempts per 15 minutes per IP.
- Session is a signed, httpOnly, SameSite=Strict cookie (7 days).
- `proxy.ts` blocks `/admin`, and every admin API route checks the session again and verifies the request origin.
- Cloudinary uploads use short-lived signatures that are only issued to a signed-in admin. The server re-checks each uploaded file with Cloudinary before saving it.
