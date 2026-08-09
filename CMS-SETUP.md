# The Crafted Canopy — Product Manager Setup

This version includes Decap CMS at `/admin/`.

## What you can manage

- Add products
- Remove products
- Change prices
- Change stock status/quantity
- Upload product images
- Add gallery images
- Edit descriptions, SKU, materials and dimensions
- Mark products as Featured, Trending, Best Seller, New Arrival or Limited Stock
- Change WhatsApp and delivery settings

## One-time Netlify setup

1. Put this project in a GitHub repository.
2. Connect that repository to your Netlify site.
3. In Netlify, open your site and enable **Identity**.
4. Set registration to **Invite only**.
5. Invite your own email address as the CMS/admin user.
6. In Netlify Identity settings, enable **Git Gateway**.
7. Open your live site and go to `/admin/`.
8. Log in with the invited Identity account.

After that, product management is done from the browser. You do not need to edit HTML, CSS or JavaScript for normal product changes.

## Adding a product

Open `/admin/` → **Products** → **Product Catalog** → add a product → upload its image → **Publish**.

Netlify will redeploy automatically after the CMS commit.

## Important

The CMS stores your catalog in `products.json` and images in `images/`. Keep every product `slug` unique and permanent.

Netlify currently documents Git Gateway as a deprecated/legacy feature, although it continues to function for existing/compatible setups. If Netlify changes availability for new sites, the site can be migrated to a GitHub-backend Decap setup without redesigning the storefront.
