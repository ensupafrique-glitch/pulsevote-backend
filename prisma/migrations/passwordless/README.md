Add these models to Prisma schema and migrate:
- MagicLinkToken(id, email, tokenHash, expiresAt, usedAt, createdAt)
- AuthChallenge(id, kind, email, challenge, expiresAt, usedAt, createdAt)
- PasskeyCredential(id, userId, webauthnUserId, credentialId, publicKey, counter, transports, backedUp, lastUsedAt, createdAt)
