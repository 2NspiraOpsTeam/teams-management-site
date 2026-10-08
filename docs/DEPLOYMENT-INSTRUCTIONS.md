# Teams Management - Deployment Instructions

## Canonical Repository

`https://github.com/2NspiraOpsTeam/teams-management-site`

## Resource Map (Single Source of Truth)

### 🔷 D1 Database
- **Name**: `teams-database-dev`
- **Database ID**: `2d04fbea-8af6-4d6d-b5bf-cf758666d55e`
- **Region**: ENAM (Europe-Netherlands-Americas)
- **Bindings**:
  - Development environment: `teams-database-dev`
  - Preview environment: `teams-database-dev` (shared for testing)
  - Production: TBD (separate dedicated DB when ready)

### 🔵 R2 Buckets (Dashboard activation required)
- `teams-media-dev` (development)
- `teams-media-preview` (preview)
- `teams-media-production` (production)

### ⚡ Worker
- **Name**: `teams-management-worker`
- **Preview URL**: To be captured after deployment
- **Production URL**: TBD

---

## Deployment Commands

### Prerequisites
```bash
cd /Users/adam/.openclaw/workspace/teams-management-app
# Ensure wrangler.toml is configured with correct D1 bindings
cat wrangler.toml
```

### 1. Build OpenNext Worker
```bash
npx @cloudflare/next-on-pages@latest build
```

### 2. Deploy Preview Environment
```bash
CLOUDFLARE_ACCOUNT_ID=36a7807b2d8726b889873bab8b572113 \
wrangler publish teams-management-preview \
  --env preview \
  --compatibility-date 2026-10-08
```

### 3. Deploy Production Environment (after preview validation)
```bash
CLOUDFLARE_ACCOUNT_ID=36a7807b2d8726b889873bab8b572113 \
wrangler publish teams-management-production \
  --env production \
  --compatibility-date 2026-10-08
```

---

## Verification Checklist

After deployment, verify:

### Public Pages (No authentication required)
- ✅ `/` - Home page renders
- ✅ `/properties` - Property list shows published buildings
- ✅ `/properties/[slug]` - Property detail with public info
- ✅ `/about` - About page loads
- ✅ `/services` - Services page loads
- ✅ `/contact` - Contact form accessible
- ✅ `/tenant-services` - Tenant gateway loads

### Admin Pages (Authentication required)
- ✅ `/admin/buildings` - Building CRUD interface
- ✅ `/admin/units` - Unit management
- ✅ `/admin/media` - Media library
- ✅ `/admin/inquiries` - Inquiry management

### Data Integrity Checks
- ✅ Published properties appear on public pages
- ✅ Unpublished properties hidden from public view
- ✅ No private/internal data leaks to public APIs
- ✅ D1 environment matches bindings (development/preview/prod)
- ✅ No 5xx errors or broken assets

---

## Next Steps After Deployment

1. **Verify Public Pages** - Test all routes above with curl/browser
2. **Exercise Admin CRUD** - Create/edit/publish buildings in admin
3. **Complete Contact Form** - Submit inquiry, verify D1 record created
4. **Run QA Tests** - Responsive design, accessibility, security projections
5. **R2 Activation** - Enable buckets in Cloudflare Dashboard when ready

---

## Troubleshooting

### "Couldn't find a D1 DB" error
Ensure `wrangler.toml` has correct environment sections:
```toml
[[d1_databases]]
binding = "DB"
database_name = "teams-database-dev"
database_id = "2d04fbea-8af6-4d6d-b5bf-cf758666d55e"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "teams-database-dev"
database_id = "2d04fbea-8af6-4d6d-b5bf-cf758666d55e"
```

### Authentication error [code: 10000]
Verify `CLOUDFLARE_ACCOUNT_ID` is correct and credentials are valid.

### "no such table" errors
Run schema migration first:
```bash
wrangler d1 execute teams-database-dev --file=src/lib/migrations/schema.sql --remote
```

---

## Commands for Reproduction

Full deployment sequence:
```bash
cd /Users/adam/.openclaw/workspace/teams-management-app

# Build
npx @cloudflare/next-on-pages@latest build

# Deploy preview
CLOUDFLARE_ACCOUNT_ID=36a7807b2d8726b889873bab8b572113 \
wrangler publish teams-management-preview \
  --env preview \
  --compatibility-date 2026-10-08

# Note down the generated preview URL from wrangler output
```

---

*Generated: 2026-10-08 - Milestone 0 Deployment Guide*
