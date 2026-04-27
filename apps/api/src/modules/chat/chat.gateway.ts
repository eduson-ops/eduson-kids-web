import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.entity';

interface JwtPayload {
  sub: string;
  role: string;
  login?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    login: string;
    name: string;
    role: string;
  };
}

interface JoinPayload {
  room: string;
}

interface SendPayload {
  room: string;
  text: string;
}

interface RtcOfferPayload {
  roomId: string;
  sdp: RTCSessionDescriptionInit;
}

interface RtcAnswerPayload {
  roomId: string;
  sdp: RTCSessionDescriptionInit;
}

interface RtcIcePayload {
  roomId: string;
  candidate: RTCIceCandidateInit;
}

interface RtcJoinRoomPayload {
  roomId: string;
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly jwtSecret: string;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('jwt.accessSecret') ?? '';
  }

  handleConnection(client: AuthenticatedSocket): void {
    const token = client.handshake.auth['token'] as string | undefined;

    if (!token) {
      client.emit('error', { message: 'Missing auth token' });
      client.disconnect(true);
      return;
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      if (!payload.sub || !payload.role) {
        throw new WsException('Invalid token payload');
      }

      client.data = {
        userId: payload.sub,
        login: payload.login ?? payload.sub,
        name: payload.name ?? payload.sub,
        role: payload.role,
      };
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: AuthenticatedSocket): void {
    // cleanup is handled automatically by Socket.IO
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinPayload,
  ): Promise<void> {
    const room = payload?.room;

    if (!room || typeof room !== 'string') {
      client.emit('error', { message: 'Invalid room' });
      return;
    }

    await client.join(room);

    const history: ChatMessage[] = await this.chatService.getHistory(room, 50);
    client.emit('history', history);
  }

  @SubscribeMessage('send')
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendPayload,
  ): Promise<void> {
    const room = payload?.room;
    const text = payload?.text;

    if (!room || typeof room !== 'string') {
      client.emit('error', { message: 'Invalid room' });
      return;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      client.emit('error', { message: 'Text must be non-empty' });
      return;
    }

    if (text.length > 2000) {
      client.emit('error', { message: 'Text exceeds 2000 characters' });
      return;
    }

    const { login, name, role } = client.data;

    const message = await this.chatService.save(room, login, name, role, text.trim());

    this.server.to(room).emit('message', message);
  }

  // ─── WebRTC signaling ────────────────────────────────────────────────────────

  @SubscribeMessage('rtc:join-room')
  async handleRtcJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcJoinRoomPayload,
  ): Promise<void> {
    const { roomId } = payload ?? {};

    if (!roomId || typeof roomId !== 'string') {
      client.emit('error', { message: 'Invalid roomId' });
      return;
    }

    const rtcRoom = `rtc:${roomId}`;
    await client.join(rtcRoom);
  }

  @SubscribeMessage('rtc:offer')
  handleRtcOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcOfferPayload,
  ): void {
    const { roomId, sdp } = payload ?? {};

    if (!roomId) return;

    const rtcRoom = `rtc:${roomId}`;
    client.to(rtcRoom).emit('rtc:offer', { roomId, sdp, fromId: client.id });
  }

  @SubscribeMessage('rtc:answer')
  handleRtcAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcAnswerPayload,
  ): void {
    const { roomId, sdp } = payload ?? {};

    if (!roomId) return;

    const rtcRoom = `rtc:${roomId}`;
    client.to(rtcRoom).emit('rtc:answer', { roomId, sdp, fromId: client.id });
  }

  @SubscribeMessage('rtc:ice')
  handleRtcIce(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcIcePayload,
  ): void {
    const { roomId, candidate } = payload ?? {};

    if (!roomId) return;

    const rtcRoom = `rtc:${roomId}`;
    client.to(rtcRoom).emit('rtc:ice', { roomId, candidate, fromId: client.id });
  }
}
