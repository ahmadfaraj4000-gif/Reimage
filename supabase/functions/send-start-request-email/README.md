# send-start-request-email

Supabase Edge Function that sends Resend emails whenever a new row is inserted
into `public.start_requests`.

This covers the website form, client portal requests, and the AI receptionist,
because they all insert into the same `start_requests` table.

## 1. Verify The Resend Domain

In Resend:

1. Go to `Domains`.
2. Add and verify the sending domain, for example `reimagebs.com`.
3. Wait until Resend shows the domain as verified.
4. Create an API key with `Sending access`.

Do not rely on `onboarding@resend.dev` for production. Use a sender on the
verified domain, such as:

```text
RE IMAGE Business Solutions <hello@reimagebs.com>
```

## 2. Set Supabase Secrets

In Supabase:

```text
Edge Functions -> Secrets
```

Add these custom secrets:

```text
RESEND_API_KEY=re_your_resend_api_key
EMAIL_WEBHOOK_SECRET=YOUR_EMAIL_WEBHOOK_SECRET
RESEND_FROM_EMAIL=RE IMAGE Business Solutions <hello@reimagebs.com>
ADMIN_NOTIFICATION_EMAIL=reimagebs@gmail.com
```

Notes:

- `RESEND_API_KEY` is the Resend key.
- `EMAIL_WEBHOOK_SECRET` is a separate shared password between the database
  webhook and the Edge Function.
- `RESEND_FROM_EMAIL` must use the verified Resend domain.
- `ADMIN_NOTIFICATION_EMAIL` receives the internal lead notification.

## 3. Disable JWT Verification For This Function

Database webhooks do not send a user JWT. This repo disables JWT verification
for this function in `supabase/config.toml`:

```toml
[functions.send-start-request-email]
verify_jwt = false
```

The function still checks the custom webhook header:

```text
x-reimage-webhook-secret
```

## 4. Deploy The Edge Function

From the project root:

```bash
supabase functions deploy send-start-request-email
```

The function name must be exactly:

```text
send-start-request-email
```

Watch for typos. A missing final `l` in `email` will create or target the wrong
function and the logs will stay empty.

## 5. Create The Database Webhook

In Supabase:

```text
Integrations -> Database Webhooks
```

Create or update the webhook:

```text
Name: send_start_request_email
Table: public.start_requests
Events: Insert
Type of webhook: Supabase Edge Functions
Edge Function: send-start-request-email
Method: POST
Timeout: 5000ms
```

Headers must be exactly:

```text
Content-Type = application/json
x-reimage-webhook-secret = reimage_start_request_email_9Kx72LmQ2026_private
```

Important: the header key is only:

```text
x-reimage-webhook-secret
```

Do not paste the secret into the header key. The secret goes in the value field.

## 6. Test The Function Directly

Before relying on the database webhook, test the Edge Function directly from:

```text
Edge Functions -> send-start-request-email -> Test
```

Use:

```text
Method: POST
```

Headers:

```text
Content-Type = application/json
x-reimage-webhook-secret = reimage_start_request_email_9Kx72LmQ2026_private
```

Body:

```json
{
  "type": "INSERT",
  "table": "start_requests",
  "schema": "public",
  "record": {
    "first_name": "Test",
    "last_name": "Lead",
    "email": "reimagebs@gmail.com",
    "phone": "5555555555",
    "business_name": "Test Biz",
    "service_choice": "General Question",
    "message": "Testing email webhook"
  }
}
```

Expected response:

```json
{
  "ok": true
}
```

## 7. Test The Full Flow

Submit a real request from one of these places:

- `start-with-us.html`
- the client portal
- the AI receptionist

Then check:

```text
Edge Functions -> send-start-request-email -> Logs
```

You should see logs like:

```text
send-start-request-email invoked
send-start-request-email payload received
send-start-request-email sending
```

Also check Resend:

```text
Resend -> Logs
```

or the API key page. The key should no longer show `No activity` after a
successful send.

## Troubleshooting

If Edge Function logs show no activity:

- The webhook is not reaching the function.
- Confirm the function name is exactly `send-start-request-email`.
- Confirm the webhook selects the same Edge Function.
- Confirm the webhook is attached to `public.start_requests`.
- Confirm the event is `Insert`.
- Confirm you saved/updated the webhook after changes.

If the function returns `Unauthorized`:

- The webhook header key must be exactly `x-reimage-webhook-secret`.
- The header value must exactly match the `EMAIL_WEBHOOK_SECRET` Supabase secret.

If the function returns `Missing RESEND_FROM_EMAIL`:

- Add the `RESEND_FROM_EMAIL` secret in Supabase.
- Use an email address on the verified Resend domain.

If Resend fails:

- Check the Edge Function log for `Customer email failed` or `Admin email failed`.
- Check the Resend Logs page for the exact delivery/API error.
- Confirm `RESEND_API_KEY` is a Resend API key with sending access.

## Current Important Values

Project URL:

```text
https://uybcjtigyujoyrunecto.supabase.co
```

Function URL:

```text
https://uybcjtigyujoyrunecto.supabase.co/functions/v1/send-start-request-email
```

Webhook header:

```text
x-reimage-webhook-secret = reimage_start_request_email_9Kx72LmQ2026_private
```
