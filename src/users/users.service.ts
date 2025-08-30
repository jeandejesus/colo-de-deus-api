/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { IncomesService } from 'src/incomes/incomes.service';
import { CategoriesService } from 'src/categories/categories.service';
import * as crypto from 'crypto';
import moment from 'moment';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private incomeService: IncomesService,
    private categoriesService: CategoriesService, // ⬅️ Injetando CategoryService
  ) {}

  async create(createUserDto: RegisterUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save(); // retorna UserDocument
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  findAll() {
    return this.userModel.find().exec();
  }

  async updateRole(id: string, newRole: UserRole) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    user.role = newRole;
    return user.save();
  }

  async addPayment(userId: string, amount: number) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    user.payments.push({ amount, date: new Date() });
    const userPay = await user.save();

    if (userPay) {
      this.incomeService.create({
        value: amount,
        date: new Date(),
        description: `Pagamento mensal de ${user.name}`,
        category: await this.categoriesService.getMonthlyPaymentCategoryId(), // Certifique-se de que
      });
      return userPay;
    }
  }

  async hasPaidThisMonth(): Promise<
    {
      _id: string;
      name: string;
      email: string;
      hasPayment: boolean;
    }[]
  > {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const users = await this.findAll();

    return users.map((user) => {
      const hasPayment = user.payments.some((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      });

      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        hasPayment,
      };
    });
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expirationDate = moment().add(1, 'hour').toDate();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expirationDate;
    await user.save();

    return resetToken;
  }

  // ✅ NOVO: Lógica de redefinição de senha movida para o service
  async resetUserPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }, // Garante que não está expirado
      })
      .exec();

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
