# Teams Management - Deployment Guide

## Infrastructure Isolation ✅

This platform is designed to be **completely independent** of 2Nspira infrastructure:

### Teams-Only Resources
- **GitHub**: `2NspiraOpsTeam/teams-management-site` (canonical repository)
- **D1 Database**: `teams-database` (separate from 2Nspira projects)
- **R2 Bucket**: `teams-media` (isolated media storage)
- **Worker**: OpenNext worker for Teams Management only
- **Custom Domain**: `portfolio.teamsmanagement.com` (example)
- **Secrets**: Environment variables specific to Teams

### Transfer Readiness

The application can be transferred to any Cloudflare account:
1. Export D1 schema + seed data (`wrangler d1 export`)
2. Upload R2 media via CLI or API
3. Copy environment configuration (excluding sensitive values)
4. Point custom domain to new worker bindings

---

## Deployment Workflow

### 1. Environment Setup

```bash
# Install Wrangler
npm install -g wrangler

# Create Cloudflare account resources first:
# - D1 database: teams-database
# - R2 bucket: teams-media  
# - Worker bindings configured
```

### 2. Database Migration

```bash
# Apply schema
wrangler d1 execute YOUR_DATABASE_NAME --file=src/lib/schema.sql

# Import seed data (development only)
node scripts/seed-database.js

# For production, import real building data via admin or CSV import
```

### 3. Media Upload

```bash
# Upload to R2 bucket
aws s3 cp public/buildings/ s3://teams-media --recursive

# Or use Wrangler R2 CLI
```

### 4. Deploy Preview

```bash
npm run build
npx opennextjs-cloudflare deploy --wrangler-path=deployment/wrangler.toml
# Uses preview domain: portfolio-preview.teamsmanagement.workers.dev
```

### 5. Production Deploy

```bash
# Update wrangler.toml: workers_dev = false
# Set correct production domain bindings
npm run build
npx opennextjs-cloudflare deploy --production
```

---

## Domain Configuration

### Custom Domain Setup (Post-Deploy)

1. **Cloudflare Dashboard**: Add `portfolio.teamsmanagement.com`
2. **DNS Records**: 
   - A record: Points to Cloudflare Worker IP (auto-managed)
   - TXT records: For verification
3. **Environment variables**: Update production bindings with domain config

### DNS Management

- Teams owns all DNS records
- Transfer-ready configuration documented
- No dependency on 2Nspira domains

---

## Environment Variables

```bash
# Production (.env.production)
NEXT_PUBLIC_APP_URL=https://portfolio.teamsmanagement.com
DATABASE_URL=d1://teams-database
R2_BUCKET=teams-media
CLOUDFLARE_ACCOUNT_ID=your-account-id
# API keys, secrets in Cloudflare dashboard
```

---

## Testing Before Deploy

```bash
# Run all tests
npm test

# Lint and typecheck
npm run lint
npm run typecheck

# Production build (catches errors)
npm run build
```

---

## Post-Deploy Verification

- [ ] Home page loads on preview domain
- [ ] All routes respond correctly (`/`, `/properties`, etc.)
- [ ] D1 database queries execute
- [ ] R2 media accessible
- [ ] No console errors
- [ ] Security tests pass (no private data exposure)
- [ ] Mobile responsive check

---

## Rollback Procedure

```bash
# If deployment fails or shows regressions:
git revert HEAD~1  # Revert to last good commit
npm run build
npx opennextjs-cloudflare deploy --production --force
```

---

## Monitoring & Observability

- Cloudflare Analytics Engine (separate from 2Nspira)
- Error logs via `wrangler tail`
- Performance metrics in Cloudflare Dashboard

---

## Client Handoff Documentation

### What Teams Owns
- GitHub repository access
- D1 database connection string
- R2 bucket name + location
- Worker bindings and secrets
- Custom domain DNS records

### Transfer Checklist
- [ ] Export current data state
- [ ] Document environment variables
- [ ] Verify backup procedures working
- [ ] Test in isolated environment
- [ ] Complete knowledge transfer session

---

## Security Checklist

Before every deploy:
- [ ] No secrets in Git history (`git filter-branch` if needed)
- [ ] Authorization headers validated server-side
- [ ] CORS configured correctly
- [ ] Private media not accessible via direct URL
- [ ] Rate limiting enabled for API routes

---

## Support & Resources

- Cloudflare Docs: https://developers.cloudflare.com/
- OpenNext: https://github.com/cloudflare/opennextjs
- Next.js: https://nextjs.org/docs
