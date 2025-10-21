import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, url: string): Promise<void> {
    const existUser = await this.userService.findOneByEmail(to);
    if (!existUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const mailOptions = {
      from: `Colo De Deus Curitiba <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Redefinição de Senha',
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
      
      <!-- Logo -->
      <div style="text-align: center; padding: 20px; background: #000000ff;">
        <img src="https://akamai.sscdn.co/letras/215x215/fotos/c/b/0/1/cb01ae0406dbf7101548d400aa4c9450.jpg" alt="Logo Colo de Deus Curitiba" style="max-width: 120px; height: auto;">
      </div>
      
      <!-- Cabeçalho -->
      <div style="background: #1d3557; padding: 20px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">Colo De Deus Curitiba</h1>
      </div>
      
      <!-- Conteúdo -->
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <h2 style="margin-top: 0;">Olá!</h2>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #1d3557; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>
        
        <p>Este link expira em <b>1 hora</b>.</p>
        <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
      </div>
      
      <!-- Rodapé -->
      <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Colo De Deus Curitiba — Todos os direitos reservados.
      </div>
      
    </div>
  </div>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`E-mail de redefinição enviado para: ${to}`);
      console.log('Mensagem ID:', info.messageId);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new InternalServerErrorException('Falha ao enviar e-mail.');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const mailOptions = {
      from: `Sua Aplicação <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Bem-vindo!',
      html: `<h1>Olá, ${name}!</h1><p>Bem-vindo à nossa plataforma.</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`E-mail de boas-vindas enviado para: ${to}`);
      console.log('Mensagem ID:', info.messageId);
    } catch (error) {
      console.error('Erro ao enviar e-mail de boas-vindas:', error);
    }
  }
}
