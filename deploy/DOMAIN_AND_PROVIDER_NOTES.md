Recommended staging setup:
- App origin: https://staging.pulsevote.app
- Email subdomain: mail.pulsevote.app
- WebAuthn RP ID: pulsevote.app

Why:
- WebAuthn RP IDs must be domains and can be a parent domain of the current origin.
- Using the parent domain lets passkeys work across related subdomains like staging and production.
- Resend requires a verified sending domain with DNS records such as SPF and DKIM before sending from your domain.
