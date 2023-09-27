import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SpeechToTextService } from './speech-to-text.service'
import { Duplex, Writable, PassThrough } from 'stream'
import * as fs from 'fs'
import * as path from 'path'
import { EditorService } from './editor.service'
import { google } from '@google-cloud/speech/build/protos/protos'
import { spawn } from 'node:child_process'


@WebSocketGateway({ cors: true })
export class AudioGateway implements OnGatewayConnection {
  private text: string = ''
  private audioFileStream: fs.WriteStream
  private initialPassThrough: PassThrough
  private audioToConvertStream: Duplex
  // private converterChain: Promise<void>[] = []
  private convertedAudioStream: PassThrough
  private audioInputStreamTransform: Duplex
  private testFilename: string

  @WebSocketServer() server: Server

  constructor(
    private speechToTextService: SpeechToTextService,
    private editorService: EditorService
  ) {
    this.testFilename = path.join(
      process.cwd(),
      `audio_stream_test_2.wav`
    )

    this.audioFileStream = fs.createWriteStream(this.testFilename)
    this.initialPassThrough = new PassThrough()
    this.convertedAudioStream = new PassThrough()
    const convertedAudioStream = this.convertedAudioStream
    this.audioToConvertStream = new Duplex({
      write(chunk, encoding, callback) {
        editorService.convertFileFfmpeg(chunk).pipe(convertedAudioStream, { end: false })
      }
    })
    this.initialPassThrough.pipe(this.audioToConvertStream, { end: false })
    this.convertedAudioStream.on('data', (data) => { console.log("convertedAudioStream", data) })
    this.convertedAudioStream.pipe(this.audioFileStream, { end: false })

  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id)
  }


  @SubscribeMessage('audioData')
  handleMessage(client: any, payload: any): void {
    if (this.initialPassThrough && this.initialPassThrough.writable) {
      console.log('audioData', payload)
      this.initialPassThrough.write(Buffer.from(payload))
    } else {
      console.log("audioData not writable")
    }
  }

}