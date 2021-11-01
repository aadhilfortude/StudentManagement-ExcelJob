import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class JobNotifications {
  @WebSocketServer()
  server: Server;

  sendSuccessMessages(message: string) {
    this.server.sockets.emit('message', { status: 1, message: message });
  }

  sendFailedMessages(message: string) {
    this.server.sockets.emit('message', { status: 2, message: message });
  }
}
