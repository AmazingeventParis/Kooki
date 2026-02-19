import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY', '');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@kooki.swipego.app');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Kooki');
    this.appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'https://kooki.swipego.app');

    if (!this.apiKey) {
      this.logger.warn('BREVO_API_KEY not set — emails will not be sent');
    }
  }

  /**
   * Send an email via Brevo API.
   */
  private async send(to: EmailRecipient, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(`Email skipped (no API key): "${subject}" to ${to.email}`);
      return false;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email: to.email, name: to.name || to.email }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Brevo API error (${response.status}): ${error}`);
        return false;
      }

      this.logger.log(`Email sent: "${subject}" to ${to.email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Email send failed: ${error.message}`);
      return false;
    }
  }

  // ========== EMAIL TEMPLATES ==========

  /**
   * Confirmation de don — envoyee au donateur.
   */
  async sendDonationConfirmation(params: {
    donorEmail: string;
    donorName: string;
    amount: number;
    currency: string;
    fundraiserTitle: string;
    fundraiserSlug: string;
  }): Promise<boolean> {
    const amountFormatted = (params.amount / 100).toFixed(2).replace('.', ',') + ' €';
    const cagnotteUrl = `${this.appUrl}/c/${params.fundraiserSlug}`;

    return this.send(
      { email: params.donorEmail, name: params.donorName },
      `Merci pour votre don de ${amountFormatted} !`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Merci ${params.donorName} !
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Votre don de <strong style="color: #FF4D6A;">${amountFormatted}</strong> a la cagnotte
          <strong>${params.fundraiserTitle}</strong> a bien ete recu.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Votre generosite fait la difference. Merci de tout coeur !
        </p>
        ${this.ctaButton('Voir la cagnotte', cagnotteUrl)}
      `),
    );
  }

  /**
   * Notification de nouveau don — envoyee au createur de la cagnotte.
   */
  async sendNewDonationNotification(params: {
    ownerEmail: string;
    ownerName: string;
    donorName: string;
    amount: number;
    currency: string;
    fundraiserTitle: string;
    fundraiserSlug: string;
    currentAmount: number;
    isAnonymous: boolean;
  }): Promise<boolean> {
    const amountFormatted = (params.amount / 100).toFixed(2).replace('.', ',') + ' €';
    const totalFormatted = (params.currentAmount / 100).toFixed(2).replace('.', ',') + ' €';
    const donor = params.isAnonymous ? 'Un donateur anonyme' : params.donorName;
    const dashboardUrl = `${this.appUrl}/dashboard`;

    return this.send(
      { email: params.ownerEmail, name: params.ownerName },
      `Nouveau don de ${amountFormatted} sur votre cagnotte !`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Nouveau don recu !
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          <strong>${donor}</strong> vient de faire un don de
          <strong style="color: #FF4D6A;">${amountFormatted}</strong> a votre cagnotte
          <strong>${params.fundraiserTitle}</strong>.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Total collecte : <strong style="color: #7B2FF7;">${totalFormatted}</strong>
        </p>
        ${this.ctaButton('Voir mon dashboard', dashboardUrl)}
      `),
    );
  }

  /**
   * Email de bienvenue — envoye apres inscription.
   */
  async sendWelcome(params: {
    email: string;
    firstName: string;
  }): Promise<boolean> {
    const createUrl = `${this.appUrl}/fundraisers/new`;

    return this.send(
      { email: params.email, name: params.firstName },
      `Bienvenue sur Kooki, ${params.firstName} !`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Bienvenue sur Kooki !
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          Bonjour ${params.firstName},
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          Votre compte Kooki est pret ! Vous pouvez maintenant creer votre premiere cagnotte
          et commencer a collecter des dons — avec <strong>0% de commission</strong>.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          100% des dons vont directement au createur de la cagnotte.
        </p>
        ${this.ctaButton('Creer ma cagnotte', createUrl)}
      `),
    );
  }

  /**
   * Notification de retrait initie.
   */
  async sendWithdrawalInitiated(params: {
    email: string;
    name: string;
    amount: number;
    currency: string;
    fundraiserTitle: string;
  }): Promise<boolean> {
    const amountFormatted = (params.amount / 100).toFixed(2).replace('.', ',') + ' €';

    return this.send(
      { email: params.email, name: params.name },
      `Retrait de ${amountFormatted} en cours`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Retrait en cours
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          Votre retrait de <strong style="color: #FF4D6A;">${amountFormatted}</strong>
          depuis la cagnotte <strong>${params.fundraiserTitle}</strong> est en cours de traitement.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Les fonds seront verses sur votre compte bancaire sous 2 a 5 jours ouvrables.
        </p>
        ${this.ctaButton('Suivre mon retrait', `${this.appUrl}/dashboard/withdrawals`)}
      `),
    );
  }

  /**
   * Notification de don echoue — envoyee au donateur.
   */
  async sendDonationFailed(params: {
    donorEmail: string;
    donorName: string;
    amount: number;
    fundraiserTitle: string;
    fundraiserSlug: string;
  }): Promise<boolean> {
    const amountFormatted = (params.amount / 100).toFixed(2).replace('.', ',') + ' €';

    return this.send(
      { email: params.donorEmail, name: params.donorName },
      `Votre don de ${amountFormatted} n'a pas abouti`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Paiement non abouti
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          Votre don de <strong>${amountFormatted}</strong> a la cagnotte
          <strong>${params.fundraiserTitle}</strong> n'a pas pu etre traite.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Pas d'inquietude, aucun montant n'a ete debite. Vous pouvez reessayer a tout moment.
        </p>
        ${this.ctaButton('Reessayer', `${this.appUrl}/c/${params.fundraiserSlug}`)}
      `),
    );
  }

  /**
   * Notification de remboursement — envoyee au donateur.
   */
  async sendRefundConfirmation(params: {
    donorEmail: string;
    donorName: string;
    amount: number;
    fundraiserTitle: string;
  }): Promise<boolean> {
    const amountFormatted = (params.amount / 100).toFixed(2).replace('.', ',') + ' €';

    return this.send(
      { email: params.donorEmail, name: params.donorName },
      `Remboursement de ${amountFormatted} confirme`,
      this.wrapTemplate(`
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 16px 0;">
          Remboursement confirme
        </h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
          Votre don de <strong>${amountFormatted}</strong> a la cagnotte
          <strong>${params.fundraiserTitle}</strong> a ete rembourse.
        </p>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Le montant sera credite sur votre moyen de paiement sous 5 a 10 jours ouvrables.
        </p>
      `),
    );
  }

  // ========== TEMPLATE HELPERS ==========

  private ctaButton(text: string, url: string): string {
    return `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="
          display: inline-block;
          background: linear-gradient(135deg, #FF4D6A 0%, #7B2FF7 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
        ">${text}</a>
      </div>
    `;
  }

  private wrapTemplate(body: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #FF4D6A 0%, #7B2FF7 100%);
      border-radius: 16px 16px 0 0;
      padding: 32px;
      text-align: center;
    ">
      <h2 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: -0.5px;">Kooki</h2>
    </div>

    <!-- Body -->
    <div style="
      background: #ffffff;
      padding: 40px 32px;
      border-radius: 0 0 16px 16px;
    ">
      ${body}
    </div>

    <!-- Footer -->
    <div style="padding: 24px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
        Kooki — La plateforme de cagnottes 0% commission
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        <a href="${this.appUrl}" style="color: #9ca3af;">kooki.swipego.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}
