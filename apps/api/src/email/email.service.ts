import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

import { PrismaService } from '../database/prisma.service';

export type RenderedEmail = {
  subject: string;
  html: string;
  text?: string;
};

@Injectable()
export class EmailTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async render(
    key: string,
    variables: Record<string, string>,
  ): Promise<RenderedEmail> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { key },
    });

    if (!template) {
      throw new Error(`Email template not found: ${key}`);
    }

    const replace = (input: string) =>
      Object.entries(variables).reduce(
        (result, [name, value]) =>
          result.replaceAll(`{{${name}}}`, value),
        input,
      );

    return {
      subject: replace(template.subject),
      html: replace(template.htmlBody),
      text: template.textBody ? replace(template.textBody) : undefined,
    };
  }
}

@Injectable()
export class MailerService {
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ??
      'Procurement AI <noreply@example.com>';

    this.transporter =
      host && port
        ? createTransport({
            host,
            port,
            secure: port === 465,
            auth: user && pass ? { user, pass } : undefined,
          })
        : null;
  }

  async sendTemplate(
    to: string,
    templateKey: string,
    variables: Record<string, string>,
  ) {
    const rendered = await this.templateService.render(templateKey, variables);

    if (!this.transporter) {
      return {
        delivered: false,
        preview: rendered,
      };
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    return { delivered: true };
  }

  async sendRaw(to: string, subject: string, html: string, text?: string) {
    if (!this.transporter) {
      return { delivered: false, preview: { subject, html, text } };
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      html,
      text,
    });

    return { delivered: true };
  }
}
