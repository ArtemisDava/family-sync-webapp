import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')) || 465,
      secure: this.configService.get('SMTP_SECURE') === 'true' || true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendUserDisabledEmail(email: string, name: string) {
    await this.sendEmailWithTemplate(
      email,
      'Account Disabled',
      'user-disabled.html',
      { name },
    );
  }

  async sendUserEnabledEmail(email: string, name: string) {
    await this.sendEmailWithTemplate(
      email,
      'Account Enabled',
      'user-enabled.html',
      { name },
    );
  }

  async sendUserDeletedEmail(email: string, name: string) {
    await this.sendEmailWithTemplate(
      email,
      'Account Deleted',
      'user-deleted.html',
      { name },
    );
  }

  private async sendEmailWithTemplate(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, string>,
  ) {
    try {
      const templatePath = path.join(__dirname, 'templates', templateName);
      let html = await fs.readFile(templatePath, 'utf8');

      for (const key in context) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
      }

      const from =
        this.configService.get<string>('SMTP_FROM') ||
        'Family Sync <noreply@familysync.com>';

      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to send email to ${to}: ${err.message}`,
        err.stack,
      );
    }
  }
}
