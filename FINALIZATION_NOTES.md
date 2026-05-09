# Finalization notes

## Included
- Passwordless auth finalized around passkeys + magic links.
- Prisma schema updated with MagicLinkToken, AuthChallenge, PasskeyCredential.
- PostgreSQL migration added for the passwordless models.
- WebAuthn verification hardened with credential lookup by rawId and challenge expiry/used checks.
- NestJS throttling added on auth endpoints.

## Still recommended before production cutover
- SMTP/provider integration in MailService.
- End-to-end tests for WebAuthn ceremonies and RLS-protected flows.
- Rotate JWT secrets via secret manager.
- Add refresh/session revocation model if long-lived sessions are needed.
- Add audit log emission for auth events.
