# TraceCore AI - Deployment Infrastructure Guide

Complete guide for deploying TraceCore AI to production with custom domain, database migration, and monitoring.

---

## 1. Custom Domain Setup

### Overview
Configure your custom domain (e.g., tracecoreai.com) to point to your TraceCore AI instance.

### Prerequisites
- Registered domain (GoDaddy, Namecheap, etc.)
- Access to domain registrar DNS settings
- SSL certificate (auto-provisioned by Manus)

### Setup Steps

**Step 1: Add Custom Domain in Manus**
1. Log in to Manus Management UI
2. Go to Project Settings → Domains
3. Click "Add Custom Domain"
4. Enter your domain (e.g., tracecoreai.com)
5. Click "Add"

**Step 2: Configure DNS Records**
Manus will provide DNS records to add:

```
Type: CNAME
Name: @ (or your domain)
Value: [Manus-provided value]
TTL: 3600
```

Add this record in your domain registrar:
1. Log in to your domain registrar
2. Go to DNS Settings
3. Add the CNAME record provided by Manus
4. Save changes (may take 15-30 minutes to propagate)

**Step 3: Verify Domain**
1. Return to Manus Management UI
2. Click "Verify Domain"
3. Wait for verification (usually 5-10 minutes)
4. Once verified, your domain is active

**Step 4: SSL Certificate**
- Manus automatically provisions SSL certificate
- HTTPS is enabled immediately after domain verification
- Certificate auto-renews before expiration

### Troubleshooting
- **Domain Not Resolving**: Check DNS records are correct and propagated
- **SSL Certificate Error**: Wait 10-15 minutes for certificate provisioning
- **Verification Failed**: Ensure CNAME record is exactly as provided

---

## 2. Database Migration (SQLite → Supabase)

### Overview
Migrate from local SQLite database to Supabase PostgreSQL for production scalability and reliability.

### Prerequisites
- Supabase account (https://supabase.com)
- Database backup
- Zero downtime migration plan

### Setup Steps

**Step 1: Create Supabase Project**
1. Sign up at https://supabase.com
2. Create new project
3. Choose region closest to your users
4. Set strong database password
5. Wait for project to initialize (2-3 minutes)

**Step 2: Get Connection String**
1. In Supabase dashboard, go to Settings → Database
2. Copy connection string (PostgreSQL)
3. Format: `postgresql://user:password@host:port/database`

**Step 3: Update Environment Variables**
1. In Manus Management UI, go to Settings → Secrets
2. Update `DATABASE_URL` with Supabase connection string
3. Save changes

**Step 4: Run Database Migration**
```bash
# In your local development environment
cd /home/ubuntu/tracecore-ai

# Push schema to Supabase
pnpm db:push

# Verify migration
pnpm db:verify
```

**Step 5: Backup SQLite Data**
```bash
# Export current data
sqlite3 ./data.db ".dump" > backup.sql

# Import to Supabase (if needed)
psql [SUPABASE_CONNECTION_STRING] < backup.sql
```

**Step 6: Test Connection**
1. Deploy to production
2. Verify data is accessible
3. Monitor for errors in logs
4. Keep SQLite backup for 7 days

### Connection String Format
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
```

### Troubleshooting
- **Connection Refused**: Check firewall allows Supabase IP
- **Authentication Failed**: Verify password is correct
- **Slow Queries**: Add database indexes for frequently queried columns
- **Connection Timeout**: Increase connection timeout in environment

---

## 3. Monitoring & Logging

### Overview
Setup error tracking, performance monitoring, and uptime monitoring for production.

### 3.1 Error Tracking (Sentry)

**Setup Steps:**
1. Sign up at https://sentry.io
2. Create new project for TraceCore AI
3. Select Node.js + React
4. Copy DSN (Data Source Name)

**Configure in TraceCore AI:**
```bash
# Add to environment variables
SENTRY_DSN=[Your Sentry DSN]
SENTRY_ENVIRONMENT=production
```

**Features:**
- ✓ Real-time error alerts
- ✓ Stack trace analysis
- ✓ Error grouping and deduplication
- ✓ Release tracking
- ✓ Performance monitoring

### 3.2 Performance Monitoring (Datadog)

**Setup Steps:**
1. Sign up at https://www.datadoghq.com
2. Create new organization
3. Install Datadog agent
4. Copy API key

**Monitor Metrics:**
- API response times
- Database query performance
- Memory usage
- CPU usage
- Request volume
- Error rates

**Setup Alerts:**
- Alert if response time > 500ms
- Alert if error rate > 1%
- Alert if CPU > 80%
- Alert if memory > 90%

### 3.3 Uptime Monitoring

**Setup Steps:**
1. Use Manus built-in uptime monitoring
2. Or use external service (UptimeRobot, Pingdom)
3. Configure health check endpoint
4. Set alert thresholds

**Health Check Endpoint:**
```
GET /api/health
Response: { status: "ok", timestamp: "..." }
```

**Alert Configuration:**
- Alert if site is down for > 5 minutes
- Alert if response time > 2 seconds
- Daily uptime report
- Monthly uptime SLA tracking

---

## 4. Go-Live Checklist

### Pre-Launch (48 hours before)

- [ ] Final security audit completed
- [ ] All tests passing (156+ tests)
- [ ] Performance testing completed (< 2s load time)
- [ ] Accessibility testing completed (WCAG AA)
- [ ] Database backup created
- [ ] Custom domain configured and verified
- [ ] SSL certificate provisioned
- [ ] Integrations tested (WooCommerce, SendGrid, Paystack)
- [ ] Email templates configured
- [ ] Monitoring and logging setup
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Support documentation ready
- [ ] Team trained on deployment process

### Launch Day

- [ ] Final backup of all data
- [ ] Deploy to production
- [ ] Verify all pages load correctly
- [ ] Test all CRUD operations
- [ ] Test integrations (orders sync, emails, payments)
- [ ] Monitor error tracking for issues
- [ ] Monitor performance metrics
- [ ] Monitor uptime status
- [ ] Check logs for errors
- [ ] Notify users of launch
- [ ] Have support team on standby

### Post-Launch (First 24 hours)

- [ ] Monitor error rates and performance
- [ ] Check integration sync status
- [ ] Verify email delivery
- [ ] Monitor database performance
- [ ] Check user feedback and support tickets
- [ ] Monitor uptime and availability
- [ ] Review logs for any issues
- [ ] Celebrate launch! 🎉

### Post-Launch (First Week)

- [ ] Monitor daily metrics
- [ ] Review user feedback
- [ ] Optimize slow queries
- [ ] Fix any reported bugs
- [ ] Monitor integration health
- [ ] Prepare weekly status report

---

## 5. Production Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=[Generate strong random string]
OAUTH_SERVER_URL=https://auth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=[Your Manus App ID]

# Integrations
WOOCOMMERCE_API_KEY=[Your WooCommerce API Key]
SENDGRID_API_KEY=[Your SendGrid API Key]
PAYSTACK_PUBLIC_KEY=[Your Paystack Public Key]
PAYSTACK_SECRET_KEY=[Your Paystack Secret Key]

# Monitoring
SENTRY_DSN=[Your Sentry DSN]
SENTRY_ENVIRONMENT=production
DATADOG_API_KEY=[Your Datadog API Key]

# Application
NODE_ENV=production
VITE_APP_TITLE=TraceCore AI
VITE_APP_LOGO=https://cdn.../logo.png
```

---

## 6. Deployment Process

### Automated Deployment
1. Commit changes to main branch
2. GitHub Actions runs tests
3. If tests pass, deploy to production
4. Monitor deployment status
5. Verify in production

### Manual Deployment
1. Create checkpoint in Manus UI
2. Click "Publish" button
3. Select production environment
4. Confirm deployment
5. Monitor deployment logs
6. Verify in production

### Rollback Process
If issues occur:
1. Go to Manus Management UI
2. Click "Version History"
3. Select previous stable version
4. Click "Rollback"
5. Confirm rollback
6. Verify system is restored

---

## 7. Maintenance & Updates

### Regular Maintenance
- Weekly: Review error logs and metrics
- Weekly: Check database performance
- Monthly: Review security logs
- Monthly: Update dependencies
- Quarterly: Full security audit

### Backup Strategy
- Daily: Automatic database backups
- Weekly: Full system backup
- Monthly: Archive backups to cold storage
- Retention: Keep 30 days of backups

### Update Process
1. Test updates in staging environment
2. Create backup before updating
3. Update dependencies
4. Run full test suite
5. Deploy to production
6. Monitor for issues

---

## Support & Troubleshooting

### Common Issues

**Database Connection Issues:**
- Check connection string is correct
- Verify firewall allows connection
- Check database credentials
- Review connection pool settings

**Performance Issues:**
- Check database query performance
- Review slow query logs
- Add database indexes
- Optimize API endpoints
- Check server resources

**Integration Issues:**
- Verify API credentials
- Check webhook configuration
- Review error logs
- Test connection manually
- Contact integration support

### Getting Help
- Check logs in Manus Management UI
- Review error tracking (Sentry)
- Check performance metrics (Datadog)
- Contact Manus support
- Review documentation

---

## Success Metrics

Track these metrics after launch:

- **Uptime**: Target 99.9%
- **Response Time**: Target < 500ms
- **Error Rate**: Target < 0.1%
- **Page Load Time**: Target < 2 seconds
- **User Satisfaction**: Target > 4.5/5 stars
- **Support Tickets**: Track and resolve quickly

---

## Next Steps

1. ✓ Setup custom domain
2. ✓ Migrate database to Supabase
3. ✓ Configure monitoring and logging
4. ✓ Complete go-live checklist
5. ✓ Deploy to production
6. ✓ Monitor first 24 hours
7. ✓ Celebrate launch!
