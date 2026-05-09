import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';
import { StartPasskeyRegistrationDto } from './dto/start-passkey-registration.dto';
import { FinishPasskeyRegistrationDto } from './dto/finish-passkey-registration.dto';
import { StartPasskeyLoginDto } from './dto/start-passkey-login.dto';
import { FinishPasskeyLoginDto } from './dto/finish-passkey-login.dto';
import { MailService } from './mail/mail.service';
import { WebauthnService } from './webauthn/webauthn.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly webauthnService: WebauthnService,
  ) {}

  async requestMagicLink(dto: RequestMagicLinkDto) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const email = dto.email.toLowerCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.magicLinkToken.create({
      data: { email, tokenHash, expiresAt },
    });

    const url = `${process.env.APP_URL || 'http://localhost:3000'}/auth/magic-link/callback?token=${rawToken}`;
    await this.mailService.sendMagicLink(email, url);
    return { accepted: true };
  }

  async verifyMagicLink(dto: VerifyMagicLinkDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const token = await this.prisma.magicLinkToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) throw new UnauthorizedException('Invalid or expired token');

    const user = await this.prisma.user.findUnique({ where: { email: token.email } });
    if (!user) throw new UnauthorizedException('Unknown user');

    const membership = await this.prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
    if (!membership) throw new UnauthorizedException('No organization membership');

    await this.prisma.magicLinkToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
    const payload = { sub: user.id, email: user.email, role: membership.role, orgId: membership.orgId };
    return { accessToken: await this.jwtService.signAsync(payload), user: payload };
  }

  async startPasskeyRegistration(email: string, dto: StartPasskeyRegistrationDto) {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new ConflictException('Email already exists');
    return this.webauthnService.startRegistration(normalizedEmail, dto.displayName || normalizedEmail);
  }

  async finishPasskeyRegistration(dto: FinishPasskeyRegistrationDto) {
    const result = await this.webauthnService.finishRegistration(dto);
    if (!result.verified || !result.registrationInfo) throw new UnauthorizedException('Passkey registration failed');

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: dto.email.toLowerCase(), displayName: dto.email.split('@')[0] },
      });

      const org = await tx.organization.create({
        data: { name: `${dto.email.split('@')[0]} workspace`, slug: `${dto.email.split('@')[0]}-workspace` },
      });

      await tx.membership.create({ data: { orgId: org.id, userId: user.id, role: 'org_admin' } });

      await tx.passkeyCredential.create({
        data: {
          userId: user.id,
          credentialId: Buffer.from(result.registrationInfo.credential.id),
          publicKey: Buffer.from(result.registrationInfo.credential.publicKey),
          counter: result.registrationInfo.credential.counter,
          transports: [],
          backedUp: false,
          webauthnUserId: dto.email.toLowerCase(),
        },
      });

      await tx.authChallenge.update({ where: { id: dto.challengeId }, data: { usedAt: new Date() } });
      const payload = { sub: user.id, email: user.email, role: 'org_admin', orgId: org.id };
      return { accessToken: await this.jwtService.signAsync(payload), user: payload };
    });
  }

  async startPasskeyLogin(dto: StartPasskeyLoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Unknown user');

    const credentials = await this.prisma.passkeyCredential.findMany({ where: { userId: user.id } });
    return this.webauthnService.startAuthentication(dto.email.toLowerCase(), credentials.map((c) => new Uint8Array(c.credentialId)));
  }

  async finishPasskeyLogin(dto: FinishPasskeyLoginDto) {
    const { verification, credential, challengeRow } = await this.webauthnService.finishAuthentication(dto);
    if (!verification.verified) throw new UnauthorizedException('Passkey login failed');

    const user = await this.prisma.user.findUnique({ where: { id: credential.userId } });
    if (!user) throw new UnauthorizedException('Unknown user');

    const membership = await this.prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
    if (!membership) throw new UnauthorizedException('No organization membership');

    await this.prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
        backedUp: verification.authenticationInfo.credentialBackedUp,
      },
    });

    await this.prisma.authChallenge.update({ where: { id: challengeRow.id }, data: { usedAt: new Date() } });
    const payload = { sub: user.id, email: user.email, role: membership.role, orgId: membership.orgId };
    return { accessToken: await this.jwtService.signAsync(payload), user: payload };
  }
}
