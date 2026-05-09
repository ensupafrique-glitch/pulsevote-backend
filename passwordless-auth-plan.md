Passwordless target architecture:
- Passkeys as primary authentication using WebAuthn ceremony start/finish endpoints.
- Magic links as fallback with hashed, single-use, short-lived tokens.
- JWT issued only after successful passwordless proof.
- Tenant role and org claims preserved in JWT for RLS-backed application access.
