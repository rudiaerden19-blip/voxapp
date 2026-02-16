# VoxApp End-to-End Testing Checklist

## Pre-requisites
- [ ] Supabase database is up and running
- [ ] ElevenLabs API key is configured
- [ ] DIDWW account is verified (for phone number features)
- [ ] Environment variables are set in Vercel

## 1. Health Check
```bash
curl https://voxapp.tech/api/health
```
- [ ] Returns status: "healthy"
- [ ] All checks pass

## 2. User Registration Flow
- [ ] Go to /register
- [ ] Fill in business details (name, email, phone, type)
- [ ] Select a plan (starter, pro, business)
- [ ] Submit registration
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Redirect to /dashboard/onboarding

## 3. Onboarding Flow
- [ ] Step 1: Business info is pre-filled from registration
- [ ] Step 2: Add services/products (test add, edit, delete)
- [ ] Step 3: Configure AI voice and greeting
- [ ] Step 4: Test AI preview (if available)
- [ ] Complete onboarding -> redirects to dashboard

## 4. Dashboard Navigation
- [ ] Overview page loads
- [ ] All module pages load based on business type
- [ ] AI settings page loads
- [ ] Usage page shows correct stats
- [ ] Settings page loads

## 5. Admin Panel
- [ ] Go to /admin
- [ ] Login with admin credentials
- [ ] Tenant list loads
- [ ] Can view tenant details
- [ ] Can block/unblock tenant
- [ ] Can edit tenant info
- [ ] Can switch modules for tenant
- [ ] Logout works

## 6. Usage Tracking
- [ ] Usage page shows current month stats
- [ ] Progress bar reflects actual usage
- [ ] Recent calls list populates after calls
- [ ] Usage history shows previous months

## 7. Phone Number / Forwarding
- [ ] Phone page loads
- [ ] Forwarding page loads
- [ ] Can add forwarding number
- [ ] Instructions are generated correctly
- [ ] Can delete forwarding number

## 8. API Endpoints
Test these with curl or Postman:

### Health
```bash
curl https://voxapp.tech/api/health
```

### Admin Auth
```bash
# Login
curl -X POST https://voxapp.tech/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@voxapp.tech","password":"VoxAdmin2024!"}'

# Check session
curl https://voxapp.tech/api/admin/auth -b cookies.txt

# Logout
curl -X DELETE https://voxapp.tech/api/admin/auth -b cookies.txt
```

### Usage
```bash
curl "https://voxapp.tech/api/usage?business_id=YOUR_BUSINESS_ID"
```

### Forwarding
```bash
curl "https://voxapp.tech/api/forwarding?business_id=YOUR_BUSINESS_ID"
```

## 9. Webhook Testing
For ElevenLabs call completion webhook:
```bash
curl -X POST https://voxapp.tech/api/webhooks/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "agent_id": "YOUR_AGENT_ID",
    "call_duration_seconds": 120,
    "call_successful": true,
    "caller_phone_number": "+32123456789"
  }'
```

## 10. SIP Incoming Call
For testing Diversion header processing:
```bash
curl -X POST https://voxapp.tech/api/sip/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+32xxxxxxxxx",
    "from": "+32987654321",
    "diversion": "<sip:+32123456789@domain>;reason=no-answer",
    "call_id": "test-call-123"
  }'
```

## Database Migrations Required
Run these SQL scripts in Supabase SQL Editor:

1. `supabase/migrations/20260216_usage_tracking.sql`
   - Creates `call_logs` table
   - Creates `usage_monthly` table

2. `supabase/migrations/20260216_forwarding_numbers.sql`
   - Creates `forwarding_numbers` table
   - Creates `pool_numbers` table

## Known Issues / TODO
- [ ] DIDWW integration pending account verification
- [ ] Admin email/password should be moved to environment variables
- [ ] Add rate limiting to public API endpoints
- [ ] Add email notifications for usage limits
