import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from '../create-event.dto/create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
