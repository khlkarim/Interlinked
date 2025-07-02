import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SignalingService } from './signaling.service';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class SignalingGateway {
  constructor(private signalingService: SignalingService) {}

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket): void {
    try {
      const uuid = this.signalingService.register(client);
      client.emit('registered', { uuid });
    } catch (err) {
      client.emit('error', err);
    }
  }

  @SubscribeMessage('message')
  handleConnect(
    @MessageBody() message: MessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      this.signalingService.find(message.source);
      const destination = this.signalingService.find(message.destination);

      destination.emit(message.type, message);
    } catch (err) {
      client.emit('error', err);
    }
  }
}
