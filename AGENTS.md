# RE IMAGE Project Notes

- Preserve the public website pages unless the requested change explicitly targets them.
- Public homepage work lives at the root `index.html` with root `assets/`; do not create a separate public Vite folder unless explicitly requested.
- Keep admin, client/login, and salesman portals in separate Vite folders.
- Use existing RE IMAGE colors, typography, button styling, nav structure, and card language before introducing new patterns.
- For the public site, prefer a white/pearl direction with navy, teal, and gold accents from the logo.
- Public work sections should show real screenshots large enough to inspect, not tiny generic cards.
- Client/work proof should appear early on the page.
- Animations must be premium and restrained: reveal, stagger, image scale, sticky polish, and route/section transitions.
- Supabase is the shared backend for portal workflows.
- Dashboard access for salesmen must stay gated until admin approval, onboarding completion, and a passing exam score.
- Admin-only sales data should remain in the admin portal and Supabase RLS policies.
