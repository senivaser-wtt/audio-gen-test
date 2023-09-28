import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SpeechToTextService } from './speech-to-text.service'
import { Duplex, Writable, PassThrough, Readable } from 'stream'
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
  private buffers: Buffer[] = []
  private convertedAudioStream: PassThrough
  private audioInputStreamTransform: Duplex
  private testFilename: string
  private counter: number = 0
  private googleStream: Duplex

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
        console.log("audioToConvertStream", chunk)
        // editorService.addToQueue(chunk, convertedAudioStream)
        callback()
      }
    })
    this.initialPassThrough.pipe(this.convertedAudioStream, { end: false })
    this.convertedAudioStream.on('data', async (data) => {
      console.log("convertedAudioStream", this.counter, data.length)
      this.buffers.push(data)
    })
    // this.convertedAudioStream.pipe(this.audioFileStream, { end: false })
    // this.convertedAudioStream.pipe(this.googleStream, { end: false })

  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id)
    this.googleStream = this.speechToTextService.createStream()
  }


  @SubscribeMessage('audioData')
  handleMessage(client: any, payload: any): void {
    if (this.googleStream && this.googleStream.writable) {
      console.log('audioData', payload)
      this.googleStream.write(payload)
    } else {
      console.log("audioData not writable")
    }
  }

  @SubscribeMessage('audioDataStop')
  stopAudio(client: any, payload: any): void {
    for (let i in this.buffers) {
      const buffer = this.buffers[i]
      fs.writeFileSync(
        path.join(process.cwd(), `/media/audio_stream_test_${i}.webm`),
        buffer
      )
      console.log(`audio_stream_test_${i}.wav`)
      console.log("buffer", buffer, buffer.length, i)
    }
  }
}