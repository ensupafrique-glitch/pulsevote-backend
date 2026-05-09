# Staging checklist

## 1. Database and Prisma
- Provision PostgreSQL staging database.
- Set DATABASE_URL.
- Run `pnpm install`.
- Run `pnpm db:generate`.
- Run `pnpm db:migrate:deploy`.

## 2. Email provider
- Create Resend account and API key.
- Add and verify sending domain/subdomain, ideally `mail.pulsevote.app`.
- Publish SPF and DKIM; add DMARC if available.
- Set `RESEND_API_KEY` and `MAIL_FROM`.

## 3. WebAuthn domain
- Use a real HTTPS staging origin, e.g. `https://staging.pulsevote.app`.
- Set `WEBAUTHN_ORIGIN=https://staging.pulsevote.app`.
- Set `WEBAUTHN_RP_ID=pulsevote.app` to allow passkeys across subdomains.
- Ensure the RP ID is a valid domain, not a URL or IP.

## 4. Validation
- Request a magic link and confirm delivery.
- Start and finish passkey registration from the real staging origin.
- Confirm tenant-protected endpoints reject missing or cross-tenant JWTs.
- Run `pnpm test:e2e`.
