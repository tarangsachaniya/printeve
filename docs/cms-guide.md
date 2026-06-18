# PrintEve Website CMS — Content Management Guide

> **Access:** Only **superadmin** users can see and use the Website CMS.  
> **Location:** Admin Panel → Sidebar → **Website** → **Website CMS**  
> **URL:** `http://localhost:3033/website`

---

## How It Works

All website content (homepage, about, contact, policies, navbar, footer) is stored in the CMS database. The frontend fetches everything from a single API endpoint (`/v1/web/site-config`) and caches it for 24 hours. When you save any change in the CMS, the cache is automatically cleared and the website reflects changes immediately — no deployment needed.

---

## Tab Overview

| Tab | What It Controls |
|-----|-----------------|
| **Homepage** | Hero section, Why Choose Us, How It Works, Testimonials, FAQ, CTA, Trust Badges |
| **About** | About page hero, stats, story, values, milestones |
| **Contact** | Contact page heading, contact detail cards (phone, email, address, hours) |
| **Privacy** | Privacy Policy page content |
| **Terms** | Terms & Conditions page content |
| **Shipping** | Shipping Policy page content |
| **Refund** | Refund Policy page content |
| **Navbar** | Main navigation links and top bar links |
| **Footer** | Footer column groups and their links |
| **Settings** | Brand name, phone, email, address, social URLs, top bar message, footer text |
| **Logs** | Audit trail of all CMS changes |

---

## Editing Page Content (Homepage, About, Contact, Policies)

### Sections

Each page is made up of **sections**. Each section has:

- **Title** — The section heading displayed on the website
- **Subtitle** — The description text below the heading
- **Layout** — How items are displayed (`full_width`, `cards`, `grid`, `two_columns`, `accordion`, `carousel`)
- **Active toggle** — Eye icon to show/hide the section on the live site

#### To edit a section:
1. Go to the page tab (e.g. Homepage)
2. Click on a section card to expand it
3. Edit the Title or Subtitle fields
4. Changes save automatically when you click away from the field

#### To reorder sections:
1. Grab the **drag handle** (⠿ icon) on the left of any section
2. Drag it to the desired position
3. Order saves automatically

#### To hide a section:
1. Click the **eye icon** on the section row
2. The section becomes grayed out and won't appear on the website
3. Click again to re-enable

#### To delete a section:
1. Click the **trash icon** on the section row
2. Confirm deletion — this removes the section and all its items

### Section Items

Items are the individual cards, FAQ entries, testimonials, steps, etc. within a section.

#### To add an item:
1. Expand a section
2. Click **+ Add Item**
3. Fill in the fields in the side panel:
   - **Title** — Item heading (e.g. FAQ question, testimonial author name, feature title)
   - **Subtitle** — Secondary text (e.g. author role, stat label)
   - **Content** — Body text (e.g. FAQ answer, testimonial quote, feature description)
   - **Image** — Upload an image or SVG via Cloudinary
   - **Icon** — Lucide icon name (e.g. `Award`, `Truck`, `ShieldCheck`, `Clock4`, `Headset`)
   - **Link URL** — Optional link destination
   - **Link Label** — Optional link text
4. Click **Save**

#### To edit an item:
1. Click the **pencil icon** next to the item
2. Modify fields in the side panel
3. Click **Save**

#### To delete an item:
1. Click the **trash icon** next to the item
2. Confirm deletion

---

## Section-by-Section Content Reference

### Homepage Sections

| Section Key | What to Edit | Item Fields Used |
|-------------|-------------|-----------------|
| `hero` | Title = headline (supports `<span class="text-primary">` for green text), Subtitle = description. CTA buttons and trust metrics are in the section's `content` and `settings` JSON. | Items = the 4 product showcase cards (title + subtitle + icon) |
| `why-choose-us` | Title = section heading, Subtitle = description | Items: title = feature name, content = description, icon = lucide icon name |
| `how-it-works` | Title = section heading, Subtitle = description | Items: title = step name, content = description. Step number is in metadata.step |
| `testimonials` | Title = section heading, Subtitle = description | Items: title = person name, subtitle = role/company, content = quote |
| `faq` | Title = section heading, Subtitle = description | Items: title = question, content = answer |
| `cta` | Title = CTA heading, Subtitle = CTA description. Button labels/links are in content JSON | No items |
| `trust-badges` | No title/subtitle | Items: title = badge text (e.g. "ISO 9001 Certified") |

### About Page Sections

| Section Key | Item Fields |
|-------------|------------|
| `hero` | Title = page heading, Subtitle = page description. No items. |
| `stats` | Items: title = stat value (e.g. "10,000+"), subtitle = stat label (e.g. "Businesses Served") |
| `story` | Title = "Our Story". Story paragraphs are in content JSON. Items = capability cards (title, subtitle, icon) |
| `values` | Items: title = value name, content = description, icon = lucide icon name |
| `milestones` | Items: title = milestone name, subtitle = description, metadata.year = year |

### Contact Page Sections

| Section Key | Item Fields |
|-------------|------------|
| `hero` | Title = page heading, Subtitle = page description |
| `contact-details` | Items: title = label (Phone/Email/etc), content = value, icon = lucide icon name, link_url = clickable link |

### Policy Pages (Privacy, Terms, Shipping, Refund)

Each has a single `content` section. The rich text HTML is stored in `content.html`. To update:

1. Go to the policy tab
2. Expand the `content` section
3. Edit the item's **Content** field with your policy text
4. Use HTML for formatting (headings, lists, paragraphs)

---

## Managing Navigation (Navbar Tab)

### Main Navigation
These are the links in the desktop and mobile navigation menu.

| Default | URL |
|---------|-----|
| Shop | /products |
| Track Order | /track-order |
| About | /about |
| Contact | /contact |

### Top Bar Links
These appear in the thin bar above the main header (desktop only).

#### To add a nav item:
1. Select **Group** (Main or Top Bar)
2. Enter **Label** and **URL**
3. Click **Add**

#### To remove a nav item:
1. Click the trash icon next to the item

---

## Managing Footer (Footer Tab)

The footer is organized into **groups** (columns). Each group has a title and a list of links.

### Default Groups

**Support:**
- Contact Us → /contact
- Track Order → /track-order
- My Orders → /account/orders
- FAQs → /faq
- About Us → /about

**Company:**
- Our Story → /about
- All Products → /products
- Bulk Orders → /account/addresses
- Become a Partner → /contact

#### To add a footer group:
1. Type the group name in "New Footer Group"
2. Click **Add Group**

#### To add a link to a group:
1. Click **+ Link** on the group header
2. Enter label and URL
3. Click **Add**

#### To remove a group or link:
Click the trash icon.

---

## Site Settings (Settings Tab)

These are global values used across the website:

| Setting | Where It Appears |
|---------|-----------------|
| **Brand Name** | Logo text, meta tags |
| **Phone** | Header top bar, footer |
| **Email** | Footer contact info |
| **Address** | Footer contact info |
| **Top Bar Message** | Desktop header top bar (e.g. "Free design proofing on every order · Pan-India delivery") |
| **Footer Description** | Footer brand description paragraph |
| **Copyright Text** | Footer bottom bar. Use `{year}` for dynamic year. |
| **Social URLs** | Facebook, Instagram, Twitter/X, LinkedIn — footer social icons |

#### To update:
1. Edit any field
2. Click **Save Settings**

---

## Audit Logs (Logs Tab)

View a chronological list of all CMS changes. Each entry shows:
- **Action** — create, update, delete, reorder
- **Entity type** — cms_page, cms_section, cms_item, cms_nav, cms_footer_group, cms_footer_link, cms_settings
- **Timestamp**

Only the 50 most recent entries are shown.

---

## Supported Lucide Icon Names

Use these icon names in the **Icon** field when editing items:

| Icon | Name |
|------|------|
| Shield with check | `ShieldCheck` |
| Clock | `Clock` or `Clock4` |
| Truck | `Truck` |
| Award / Trophy | `Award` |
| Headset | `Headset` |
| Factory | `Factory` |
| Users | `Users` |
| Heart | `Heart` |
| Sparkles | `Sparkles` |
| Phone | `Phone` |
| Mail | `Mail` |
| Map Pin | `MapPin` |

Full list: [lucide.dev/icons](https://lucide.dev/icons)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Changes not appearing on website | The cache clears automatically on save. If still stale, go to Admin sidebar → **Clear Cache** button, or wait up to 24 hours for automatic expiry. |
| "Page not found in CMS" message | Run the seed script: `bun run scripts/seed-website-cms.ts` |
| 403 Forbidden on CMS APIs | Only superadmin role has access. Check your user role. |
| Image upload fails | Check Cloudinary environment variables are set (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) |

---

## API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/v1/web/site-config` | GET | Public | Returns all CMS data (cached 24h) |
| `/admin/website/pages` | GET | SuperAdmin | List all CMS pages |
| `/admin/website/pages/:pageId/sections` | GET | SuperAdmin | List sections with items |
| `/admin/website/sections/:id` | PATCH | SuperAdmin | Update a section |
| `/admin/website/sections/:sectionId/items` | POST | SuperAdmin | Create an item |
| `/admin/website/items/:id` | PATCH | SuperAdmin | Update an item |
| `/admin/website/items/:id` | DELETE | SuperAdmin | Delete an item |
| `/admin/website/navigation` | GET/POST | SuperAdmin | List/create nav items |
| `/admin/website/footer` | GET | SuperAdmin | List footer groups with links |
| `/admin/website/settings` | GET/PATCH | SuperAdmin | Read/update site settings |
| `/admin/website/audit-logs` | GET | SuperAdmin | View CMS change history |
