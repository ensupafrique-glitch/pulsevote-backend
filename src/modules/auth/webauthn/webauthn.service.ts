import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { base64urlToBuffer } from '../utils/base64url';

@Injectable()
export class WebauthnService {
  constructor(private readonly prisma: PrismaService) {}

  async startRegistration(email: string, displayName: string) {
    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const rpName = process.env.WEBAUTHN_RP_NAME || 'PulseVote AI';
    const challengeId = crypto.randomUUID();

    const options = await generateRegistrationOptions({
      rpID,
      rpName,
      userName: email,
      userDisplayName: displayName,
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await this.prisma.authChallenge.create({
      data: {
        id: challengeId,
        kind: 'passkey_registration',
        email,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return { challengeId, options };
  }

  async finishRegistration(input: { email: string; challengeId: string; response: Record<string, unknown> }) {
    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
    const challengeRow = await this.prisma.authChallenge.findUnique({ where: { id: input.challengeId } });

    if (!challengeRow || challengeRow.usedAt || challengeRow.expiresAt <= new Date()) {
      throw new UnauthorizedException('Challenge expired or already used');
    }

    const verification = await verifyRegistrationResponse({
      response: input.response as any,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    return { verified: verification.verified, registrationInfo: verification.registrationInfo };
  }

  async startAuthentication(email: string, credentialIDs?: Uint8Array[]) {
    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const challengeId = crypto.randomUUID();

    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials: (credentialIDs || []).map((id) => ({ id, type: 'public-key', transports: ['internal', 'hybrid', 'usb', 'ble', 'nfc'] })),
    });

    await this.prisma.authChallenge.create({
      data: {
        id: challengeId,
        kind: 'passkey_login',
        email,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return { challengeId, options };
  }

  async finishAuthentication(input: { challengeId: string; response: Record<string, unknown> }) {
    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
    const challengeRow = await this.prisma.authChallenge.findUnique({ where: { id: input.challengeId } });

    if (!challengeRow || challengeRow.usedAt || challengeRow.expiresAt <= new Date()) {
      throw new UnauthorizedException('Challenge expired or already used');
    }

    const rawId = String((input.response.rawId || input.response.id || '') as string);
    if (!rawId) throw new UnauthorizedException('Missing credential id');

    const credentialID = base64urlToBuffer(rawId);
    const credential = await this.prisma.passkeyCredential.findFirst({ where: { credentialId: credentialID } });
    if (!credential) throw new UnauthorizedException('Unknown credential');

    const verification = await verifyAuthenticationResponse({
      response: input.response as any,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: new Uint8Array(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as any,
      },
      requireUserVerification: true,
    });

    return { verification, credential, challengeRow };
  }
}
