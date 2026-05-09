import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  async sendMagicLink(email: string, url: string) {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY missing; magic link for ${email}: ${url}`);
      return { delivered: false, mode: 'log-only' };
    }

    const from = process.env.MAIL_FROM || 'PulseVote <auth@mail.pulsevote.app>';
    const subject = 'Votre lien de connexion PulseVote';
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Connexion à PulseVote</h2>
        <p>Cliquez sur le lien ci-dessous pour vous connecter.</p>
        <p><a href="${url}">Se connecter</a></p>
        <p>Ce lien expire dans 15 minutes et ne peut être utilisé qu'une seule fois.</p>
      </div>
    `;

    const result = await this.resend.emails.send({
      from,
      to: email,
      subject,
      html,
    });

    this.logger.log(`Magic link email queued for ${email}`);
    return { delivered: true, provider: 'resend', id: result.data?.id };
  }
}
