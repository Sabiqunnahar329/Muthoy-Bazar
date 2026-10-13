# Muthoy Bazar

সাধ্যের মধ্যে স্বস্তির বাজার — Affordable and comfortable shopping.

A grocery e-commerce site for Bangladesh built with the MERN stack
(MongoDB, Express, React (Create React App) + Tailwind, Node). No Vite.

## What is included

**Storefront**
- Home page with banners, featured categories, top selling, offer zone, new arrivals, brands and "Load more"
- Shop page with category, brand, offer/new/best filters, search and sorting
- Product names switch between Bengali and English with the storefront language; Bengali catalog names are populated by `npm run seed` and editable in Admin > Product
- Product page, cart drawer with "You may also like", one-page checkout
  (delivery charge worked out automatically: 80 BDT when the city or address says Dhaka, 150 BDT elsewhere; Cash on delivery, bKash, Nagad, coupon codes)
- Order tracking by order ID, optional customer login and registration, forgot password
- Bangla / English toggle, chat widget (website message form, Facebook Messenger and WhatsApp), footer with map and policy pop-ups
- After an order is delivered, the customer receives an SMS feedback link to rate each purchased item and optionally write a review

**Admin** (`/admin`, login required)
- Dashboard: revenue, orders, pending, low stock, 7-day chart, recent orders
- Product: add, edit, delete, upload pictures, stock, discount prices, flags
- Sales: search and filter orders, order details, change status (stock is restored on cancel)
- Stock Management: quick stock adjustment, lowest stock first
- Customer: order history summary and CSV export of phone numbers
- Coupons: percentage or fixed, minimum cart, expiry
- Roles: super_admin, admin, inventory_manager, delivery_operator
- Expenses: income and expense entries with date, type and category filters, summary cards, edit and delete
- Landing Page: build pages for ad campaigns (banner URL, headline, sections, button, highlighted products). Published pages open at `/lp/<address>`
- Staff Management: add staff, choose a role (Admin, Manager, Staff), toggle which modules each person can open, enable or disable accounts
- Report: sales vs expenses, monthly trend and top products charts (Recharts)
- Fraud Checker and IP Block: look up a phone number or IP address, see its order history and risk level, and blacklist it. Blocked phones and IPs cannot place orders, register or send messages
- Menu Builder: drag to reorder, edit, hide and add header and footer links. The storefront uses them once the menu has items
- Notifications: alerts for new orders, low stock and customer messages with read and unread state, and unread badges in the sidebar
- Support Mailbox and Contact Form Queries: messages from the website contact form, with reply (sent by SMS when the customer left a phone number)
- Configurations: store name, currency, tax rate, phone, WhatsApp, email and address
- Server Stats: database connection, uptime, memory and record counts
- Website: homepage announcement and hero content editor
- Image rules: product image audit (uploads accept JPEG, PNG, WebP or GIF up to 3 MB)
- Activity Log: successful staff changes; request contents and customer details are excluded
- Pixel Stats: first-party event analytics stored in MongoDB; events are not sent to Meta
- Meta Catalog: downloadable CSV feed for import; it does not sync automatically to Meta
- Roles: super_admin, admin (shown as Admin), inventory_manager (shown as Manager), delivery_operator (shown as Staff)

**Server**
- REST API with JWT login, role checks, rate limiting on auth routes, helmet and CORS
- Atomic stock deduction, server-side price calculation, phone validation, repeat-cancel "Risky" flag on orders
- SMS helper (Greenweb), including delivery updates and post-delivery feedback links. Without `SMS_TOKEN`, messages are printed in the server console

## Run it locally

You need Node.js 18 or newer and MongoDB (local or Atlas).

```bash
# 1. Server
cd server
cp .env.example .env        # then edit MONGO_URI, JWT_SECRET and the admin password
npm install
npm run seed                # adds 41 categories, 105 products and the admin account
npm run dev                 # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm start                   # http://localhost:3000  (/api is proxied to http://localhost:5000)
```

Admin login: the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`
(default `admin@muthoybazar.com` / `ChangeMe123`). Change the password before going live.

`npm run seed -- --fresh` wipes categories and products and loads the catalog again.
To populate Bengali names on an existing catalog, deploy the updated server and run `npm run seed` once from `server` with its production `MONGO_URI`; this updates product-name translations without replacing products, stock, or categories. Do not use `--fresh` for this.

## Product pictures

- Put your own photos in `client/public/products/` named after the product, for example
  `client/public/products/premium-miniket-rice.jpg` (lowercase, spaces become dashes).
- Or upload pictures in Admin > Product. Uploads are saved in `server/uploads/`.
- Until a picture exists, the product card shows an emoji for its category.

## Going live

### Option A: one server for everything (easiest, no CORS or proxy problems)

The Express server also serves the React build, so the website and the API share one domain.
On Render (Web Service), Railway, a VPS, etc.:

- Build command: `npm run build` (run in the project root, builds `client/build`) and `npm install --prefix server`
  - Render: `npm install --prefix server && npm run build`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your site address), `NODE_ENV=production`, `TRUST_PROXY=1`
- Leave `REACT_APP_API_URL` empty.
- For persistent product images on Render's free plan, create a Cloudinary account and add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to the service environment. New admin uploads then go to Cloudinary. Production uploads are rejected until Cloudinary is configured, rather than saving files that would disappear on redeploy.

### Option B: frontend on Vercel/Netlify, API on Render

- Vercel: set the project root to `client`. Build command `npm run build`, output directory `build`.
  Edit `client/vercel.json` and replace `YOUR-API-DOMAIN` with your API address. Leave `REACT_APP_API_URL` empty.
- Netlify: base directory `client`, build `npm run build`, publish `client/build`. `public/_redirects` handles page refreshes.
  Add a redirect for `/api/*` and `/uploads/*` to your API, or set `REACT_APP_API_URL=https://your-api/api`.
- The production build disables the ESLint webpack plugin (`client/.env.production` sets `DISABLE_ESLINT_PLUGIN=true`); local development lint remains enabled.

### Always

- Set `CLIENT_URL` in `server/.env` to your site address, use a long random `JWT_SECRET`, and set `NODE_ENV=production`
  (this also hides the development reset code on the forgot-password page).
- If the API runs behind a reverse proxy, set `TRUST_PROXY=1`, otherwise IP blocking sees the proxy address instead of the visitor.
- When Cloudinary is configured, newly uploaded product pictures are stored in the `muthoy-bazar/products` folder. Existing `/uploads/...` files are not migrated automatically; download/keep a copy before changing hosting if they are still available.
- Password reset codes for email accounts are printed in the server console. Connect an email service in
  `server/src/controllers/authController.js` to send them. Phone accounts receive the code by SMS.

## Not built yet

Courier integration (Steadfast, Pathao, RedX), Facebook Pixel and Conversion API, thermal invoice PDF
and bulk import/export of products.
