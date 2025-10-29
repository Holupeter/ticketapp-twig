# TicketApp — Twig Implementation

## Overview
Server-rendered Twig application + small client-side JS that provides:
- Landing page with wave hero and decorative circles.
- Auth (Login/Signup) simulated via `localStorage` key `ticketapp_session`.
- Protected routes: Dashboard and Tickets (JS enforces redirect).
- Ticket Management (Create/Read/Update/Delete) stored under `ticketapp_tickets`.
- Inline validation, toast/snack notifications, consistent layout (max-width 1440px).

## Setup
1. Install PHP and Composer.
2. Install dependencies:
   ```bash
   composer install


(Optional) Install Tailwind for styles:

npm install
npx tailwindcss -i ./public/assets/css/styles.css -o ./public/assets/css/output.css --watch


or use the included styles.css as plain CSS.

Run the dev server:

php -S 127.0.0.1:8000 -t public


Visit: http://127.0.0.1:8000/

Keys (exact)

Session key: ticketapp_session

Tickets key: ticketapp_tickets

Test credentials

Any email/password combination works for demo. Example:

Email: test@example.com

Password: password123

Notes & Known limitations

This is a front-end simulation: all auth and data live in localStorage. For production you would replace the client storage with API calls to a backend.

Protected routing is enforced client-side by app.js. Server-side access control is minimal (server renders static pages).

To make server enforce authentication you would add PHP session handling and route middleware.

Accessibility

Semantic HTML (labels for inputs).

Visible focus states and sufficient contrast for text and controls.

Hero SVG is aria-hidden="true" as decorative.


---

# Acceptance checklist (how to verify)
- [ ] Start server and open `/` — hero renders, max width centered.
- [ ] Create user: go to `/auth/signup` and sign up (or login). `ticketapp_session` added to localStorage.
- [ ] After login, `/dashboard` loads (JS guard redirects unauthorized).
- [ ] Tickets page (`/tickets`) shows form and list; create a ticket (title + status) — success toast shown and card appears.
- [ ] Edit a ticket: click edit -> form prepopulates -> update -> success toast.
- [ ] Delete a ticket: click delete -> confirm -> success toast and removed from list.
- [ ] Open/Resolve counts are shown on `/dashboard`.
- [ ] Session expiry: `ticketapp_session.expires` causes redirect + toast when expired.
- [ ] All validation rules:
  - `title` required.
  - `status` must be one of `open`, `in_progress`, `closed`.
  - Optional fields validated for length (e.g., description <= 2000).
- [ ] Visual rules:
  - At least two decorative circular elements overlap hero.
  - Wavy SVG at bottom of hero present.
  - Max width 1440px layout enforced.

---

# Next steps I can do for you (pick one)
- (A) Produce a ready-to-download zip of this Twig project with all files wired.
- (B) Convert the same templates into a lightweight PHP API (so server-side creates/updates tickets in a JSON file) — still keeping Twig views.
- (C) Help you wire this into a GitHub repo and provide an example `README` with deploy instructions (Netlify/Render/Heroku as needed).
- (D) Create an identical visual style guide (exact Tailwind tokens & SVG assets) to reuse for React and Vue versions.

Tell me which one you want and I’ll generate the files (A/B/C/D). If you want the ZIP or full repo commits, say “Do A” and I’ll produce a packaged scaffold.
::contentReference[oaicite:0]{index=0}
