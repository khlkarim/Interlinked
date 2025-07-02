import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class SignalingService {
  nodes: Record<string, Socket> = {};

  register(client: Socket): string {
    const uuid = crypto.randomUUID();

    if (this.nodes[uuid]) {
      throw new WsException('UUID already taken');
    }

    this.nodes[uuid] = client;
    return uuid;
  }

  find(uuid: string): Socket {
    if (!this.nodes[uuid]) {
      throw new WsException('Node not found');
    }

    return this.nodes[uuid];
  }
}
