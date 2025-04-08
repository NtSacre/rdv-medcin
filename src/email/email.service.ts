import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Ajustez selon votre fournisseur d'email
      port: 587,
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: 'your-email', // Votre email
        pass: 'yourpassword', // Mot de passe d'application
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: '"MediConnect" <sacrentandou2.0@gmail.com>',
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${to}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${to} :`, error);
      throw new Error('Échec de l’envoi de l’email');
    }
  }
}