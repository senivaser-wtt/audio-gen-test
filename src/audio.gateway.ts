import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SpeechToTextService } from './speech-to-text.service'
import { Duplex, PassThrough, Readable, Writable } from 'node:stream'
import * as fs from 'fs'
import * as path from 'path'
import { EditorService } from './editor.service'


@WebSocketGateway({ cors: true })
export class AudioGateway implements OnGatewayConnection {
  private readable: Readable

  @WebSocketServer() server: Server

  constructor(
    private speechToTextService: SpeechToTextService,
    private editorService: EditorService
  ) {

    this.readable = new Readable({
      read() {}
    });

    const ffmpeg = this.editorService.convertFileFfmpeg(this.readable);
    const googleStream = this.speechToTextService.createStream();
    ffmpeg.pipe(googleStream);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id)
  }


  @SubscribeMessage('audioData')
  handleMessage(client: any, payload: any): void {
    this.readable.push(payload);
  }

}