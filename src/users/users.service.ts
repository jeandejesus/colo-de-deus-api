import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { IncomesService } from 'src/incomes/incomes.service';
import { CategoriesService } from 'src/categories/categories.service';
import * as crypto from 'crypto';
import moment from 'moment';
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { NominatimService } from 'src/services/nominatim/nominatim.service';
import dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private incomeService: IncomesService,
    private categoriesService: CategoriesService, // ⬅️ Injetando CategoryService
    private readonly nominatimService: NominatimService,
  ) {}

  async create(createUserDto: RegisterUserDto): Promise<UserDocument> {
    const fullAddress = `${createUserDto.address.street}, ${createUserDto.address.city}, ${createUserDto.address.state}`;

    const coords = await this.nominatimService.getCoordinates(fullAddress);

    createUserDto.address.location = coords
      ? {
          type: 'Point',
          coordinates: [coords.lon, coords.lat],
        }
      : undefined;

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

  async findAllPaginate(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find().sort({ name: 1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
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

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select({
        password: 0,
        resetPasswordExpires: 0,
        resetPasswordToken: 0,
      })
      .exec();
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatePayload: any = { ...updateUserDto };

    // This block correctly handles the password
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      // If the password is not provided, remove it from the payload
      delete updatePayload.password;
    }

    // Handle the nested address fields
    if (updateUserDto.address) {
      if (updateUserDto.address.street) {
        updatePayload['address.street'] = updateUserDto.address.street;
      }
      if (updateUserDto.address.neighborhood) {
        updatePayload['address.neighborhood'] = updateUserDto.address.neighborhood;
      }
      if (updateUserDto.address.city) {
        updatePayload['address.city'] = updateUserDto.address.city;
      }
      if (updateUserDto.address.state) {
        updatePayload['address.state'] = updateUserDto.address.state;
      }
      delete updatePayload.address;
    }

    // ✅ Use the prepared updatePayload instead of updateUserDto
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }
    return updatedUser;
  }

  // 🔹 Atualiza coordenadas do usuário
  async updateCoordinates(userId: string, lat: number, lon: number): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { 'address.location': { type: 'Point', coordinates: [lon, lat] } },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    return updatedUser;
  }

  // 🔹 Opcional: busca usuários sem coordenadas
  // Mongoose
  async findWithoutCoordinates(): Promise<User[]> {
    return this.userModel
      .find({
        $or: [{ 'address.location': { $exists: false } }, { 'address.location': null }],
      })
      .exec();
  }

  async findAllWithLocation() {
    return this.userModel
      .find({
        'address.location': { $exists: true },
        'address.location.coordinates': { $ne: [] },
      })
      .select('name address.street address.location address.city address.state')
      .exec();
  }

  async findNearAddress(address: string) {
    if (!address) {
      throw new BadRequestException('Endereço é obrigatório.');
    }

    // 1️⃣ Obter coordenadas do endereço informado
    const coords = await this.nominatimService.getCoordinates(address);
    if (!coords) {
      throw new BadRequestException('Endereço não encontrado.');
    }

    // 2️⃣ Buscar missionários próximos usando geoQuery
    const radiusKm = 10; // raio em km
    const radiusMeters = radiusKm * 1000;

    const nearbyUsers = await this.userModel
      .find({
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coords.lon, coords.lat],
            },
            $maxDistance: radiusMeters,
          },
        },
      })
      .select('name address.location address.city address.state');

    return {
      origin: { lat: coords.lat, lon: coords.lon },
      count: nearbyUsers.length,
      users: nearbyUsers,
    };
  }

  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result; // retorna o doc deletado ou null se não existir
  }

  async getMonthlyContributionProgress(start?: string, end?: string) {
    const now = dayjs();

    // Se não vierem datas, usa o mês atual
    const startOfMonth = start ? dayjs(start).toDate() : now.startOf('month').toDate();
    const endOfMonth = end ? dayjs(end).toDate() : now.endOf('month').toDate();

    // Conta total de usuários
    const totalUsers = await this.userModel.countDocuments();

    // Conta quantos pagaram dentro do intervalo
    const usersWhoPaid = await this.userModel.countDocuments({
      payments: {
        $elemMatch: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
    });

    const paidPercentage = totalUsers > 0 ? (usersWhoPaid / totalUsers) * 100 : 0;

    const remainingPercentage = 100 - paidPercentage;

    return {
      totalUsers,
      usersWhoPaid,
      paidPercentage: parseFloat(paidPercentage.toFixed(1)),
      remainingPercentage: parseFloat(remainingPercentage.toFixed(1)),
      start: startOfMonth,
      end: endOfMonth,
    };
  }
}
