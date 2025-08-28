// src/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VocationalYear } from 'src/enums/VocationalYearEnum.enum';

export enum UserRole {
  ADMIN = 'admin',
  FINANCEIRO = 'financeiro',
  MEMBRO = 'membro',
}

@Schema()
export class Address {
  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  neighborhood!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// 2. Defina o tipo do documento de usuário
export type UserDocument = User & Document;

// 3. Modifique o schema do usuário para usar o subdocumento
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  birthDate!: Date;

  @Prop({ required: true })
  phone!: string;

  // Utilize o subdocumento criado.
  // O tipo deve ser a CLASSE 'Address', e o 'type' deve ser o 'AddressSchema'
  @Prop({ required: true, type: AddressSchema })
  address!: Address;

  @Prop({ required: true, enum: VocationalYear })
  vocationalYear!: VocationalYear;

  @Prop({ required: true })
  trainer!: string;

  @Prop({
    type: Number,
    required: false, // Campo opcional
    min: [1, 'O dia deve ser no mínimo 1'],
    max: [31, 'O dia deve ser no máximo 31'],
  })
  monthlyContributionDay?: number;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.MEMBRO,
    required: true,
  })
  role?: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
