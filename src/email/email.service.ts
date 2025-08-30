import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com', // Added a fallback
      port: parseInt(process.env.EMAIL_PORT || '587', 10), // ✅ Corrigido
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async sendPasswordResetEmail(to: string, url: string): Promise<void> {
    const mailOptions = {
      from: `Sua Aplicação <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Redefinição de Senha',
      html: `
        <h1>Olá!</h1>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${url}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-mail de redefinição enviado para: ${to}`);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new InternalServerErrorException(
        'Falha ao enviar e-mail de redefinição.',
      );
    }
  }

  // Você pode adicionar outros métodos para outros tipos de e-mail
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    // ...
  }
}
