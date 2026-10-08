# Teams Management - QA Checklist (Milestone 0)

## Responsive Design Testing

### Desktop (1920px+)
- [ ] Navigation collapses properly on resize
- [ ] Property cards display in 3-column grid
- [ ] Forms validate input correctly
- [ ] Images lazy load with responsive sizes

### Tablet (768-1024px)
- [ ] Mobile menu displays toggle button
- [ ] Property cards shift to 2-column layout
- [ ] Footer sections stack vertically
- [ ] Tables scroll horizontally if needed

### Mobile (<768px)
- [ ] Header hamburger menu works
- [ ] Forms have proper touch targets (44px+)
- [ ] Images scale appropriately
- [ ] Reading line length ~60-70 characters

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- [ ] Primary text on white > 4.5:1
- [ ] Links distinguishable from backgrounds
- [ ] Focus indicators visible (outline or color change)

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Modal/dialogs trap focus appropriately
- [ ] Escape key closes overlays if used

### Screen Reader Support
- [ ] Images have alt text
- [ ] Landmarks semantic (header, main, footer)
- [ ] Form labels properly associated
- [ ] Heading hierarchy correct (h1 → h2 → h3)

## Content & Copy

### Home Page
- [ ] Hero section communicates value proposition clearly
- [ ] Property cards show relevant info without data leaks
- [ ] Contact CTA prominent and obvious

### Portfolio Pages
- [ ] Building addresses from client provided
- [ ] Empty states shown when no published properties
- [ ] Filter/sort UI functional (even if limited scope)

### Forms
- [ ] Validation messages clear and helpful
- [ ] Success confirmation displayed
- [ ] Error handling doesn't expose sensitive data
- [ ] Submission persists to D1 before notification

## Security Verification

### Public API Boundaries
- [ ] `/api/buildings/[slug]` returns only approved fields
- [ ] Unit array never exposed publicly  
- [ ] Private media inaccessible via direct URL
- [ ] No internal status fields in public responses

### Authorization (Admin)
- [ ] Admin routes not accessible without auth headers
- [ ] Role permissions enforced server-side
- [ ] Cross-property data access denied appropriately

## Performance

### Core Web Vitals Targets
- [ ] LCP < 2.5s (hero image prioritized)
- [ ] FID < 100ms (minimal JS blocking)
- [ ] CLS < 0.1 (reserved image dimensions)

### Optimization
- [ ] Images served with proper `width`/`height` attributes
- [ ] Next.js image component lazy loading working
- [ ] CSS critical path minimized
- [ ] No render-blocking resources

## Browser Support

### Modern Browsers
- [ ] Chrome 109+
- [ ] Firefox 105+  
- [ ] Safari 16.4+
- [ ] Edge 109+

### iOS/Android
- [ ] iOS Safari 16+ responsive behavior
- [ ] Android Chrome responsive behavior
- [ ] Touch interactions smooth (no scroll jank)

## Deployment Readiness

- [ ] Build passes without errors or warnings
- [ ] No `.env` files in git history
- [ ] Error pages functional (`/_not-found`)
- [ ] Sitemap.xml generated correctly
- [ ] robots.txt appropriate (public site crawlable)

## Known Issues / TODOs

1. **Media placeholder images** - Replace with actual property photography before launch
2. **API integration** - Connect `/api/buildings/[slug]` to D1 queries
3. **Admin auth** - Implement JWT/session auth for admin routes
4. **R2 integration** - Upload actual media assets and update `storage_key` values

## Sign-off

- [ ] All responsive breakpoints tested
- [ ] Accessibility issues addressed  
- [ ] Security boundary tests passed
- [ ] Performance metrics within targets
- [ ] Ready for preview deployment

---

*Last updated: 2026-10-07*
