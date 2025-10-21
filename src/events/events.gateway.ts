import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class EventsGateway {
  @WebSocketServer() server!: Server;

  afterInit(server: Server) {
    console.log('Gateway iniciado');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinEvent')
  handleJoinEvent(@MessageBody() eventId: string, @ConnectedSocket() client: Socket) {
    client.join(eventId);
  }

  emitParticipantsUpdate(eventId: string, participants: any[]) {
    this.server.to(eventId).emit('participantsUpdate', participants);
  }
}
