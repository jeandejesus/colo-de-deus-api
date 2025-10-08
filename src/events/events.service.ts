// src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto/update-event.dto';
import { EventDocument } from './schemas/event.schema/event.schema';
import {
  Registration,
  RegistrationDocument,
} from './schemas/event.schema/registration.schema';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { EventsGateway } from './events.gateway';
import { use } from 'passport';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<RegistrationDocument>, // <-- aqui o erro
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<any> {
    const event = new this.eventModel(createEventDto);
    return event.save();
  }

  async findAll(): Promise<any[]> {
    return this.eventModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<any> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Evento não encontrado');
  }

  // Inscrever usuário
  // src/events/events.service.ts

  async subscribe(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    const alreadyRegistered = await this.registrationModel.findOne({
      event: eventId,
      user: userId,
    });

    if (alreadyRegistered) {
      throw new BadRequestException('Usuário já inscrito');
    }

    const qrCode = uuidv4();

    // Cria documento na collection registration
    const registration = new this.registrationModel({
      event: eventId,
      user: userId,
      qrCode,
      checkedIn: false,
    });

    await registration.save();

    // Opcional: ainda manter no participants do evento
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('name')
      .exec();

    event.participants.push({ user: userId, qrCode, userName: user?.name });
    await event.save();

    return { msg: 'Inscrição realizada com sucesso', qrCode };
  }

  // Check-in do usuário pelo QR Code
  async checkin(eventId: string, qrCode: string) {
    const event = await this.findOne(eventId);

    const participant = event.participants.find((p) => p.qrCode === qrCode);
    if (!participant) {
      throw new BadRequestException('QR Code inválido');
    }

    if (participant.checkedIn) {
      throw new BadRequestException('Check-in já realizado');
    }

    participant.checkedIn = true;
    await event.save();

    this.eventsGateway.emitParticipantsUpdate(eventId, event.participants);

    return { msg: 'Check-in realizado com sucesso' };
  }

  async getUserQRCode(eventId: string, userId: string) {
    const registration = await this.registrationModel.findOne({
      event: eventId,
      user: userId,
    });
    if (!registration) throw new NotFoundException('Inscrição não encontrada');

    const populatedEvent: any = registration.event;

    return {
      qrCode: registration.qrCode,
      eventTitle: populatedEvent.title,
    };
  }

  async getParticipants(eventId: string) {
    const event = await this.eventModel
      .findById(eventId)
      .populate({
        path: 'participants.user',
        select: 'name',
      })
      .exec();

    if (!event) throw new NotFoundException('Evento não encontrado');

    return event.participants.map((p) => ({
      userName: (p.user as any)?.name || 'Usuário não encontrado',
      qrCode: p.qrCode,
      checkedIn: p.checkedIn,
      userId: (p.user as any)?._id,
    }));
  }

  async getUserRegistrations(userId: string) {
    const registrations = await this.registrationModel.find({ user: userId });
    return registrations.map((r) => ({
      eventId: r.event.toString(),
      qrCode: r.qrCode,
    }));
  }
}
