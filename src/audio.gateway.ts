import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SpeechToTextService } from './speech-to-text.service'
import { Duplex, Writable } from 'stream'
import * as fs from 'fs'
import * as path from 'path'
import { EditorService } from './editor.service'


@WebSocketGateway({ cors: true })
export class AudioGateway implements OnGatewayConnection {
  private text: string = ''
  private recognizeStream: Duplex
  private audioFileStream: fs.WriteStream
  private audioFileStreamData: Buffer[]
  private audioInputStreamTransform: Writable
  private myBlob: Blob
  private testFilename: string

  @WebSocketServer() server: Server

  constructor(
    private speechToTextService: SpeechToTextService,
    private editorService: EditorService
  ) {
    this.testFilename = path.join(
      process.cwd(),
      `audio_stream_test.webm`
    )
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id)
    // this.recognizeStream = this.speechToTextService.createStream()
    // this.speechToTextService.startStream(this.streamDataCallback.bind(this), "x")
  }

  @SubscribeMessage('audioData')
  handleMessage(client: any, payload: any): void {
    // console.log('audioData', payload)
    // if (this.audioInputStreamTransform.writable) {
    // this.audioInputStreamTransform.write(
    //   Buffer.from(payload)
    // )
    this.recognizeStream.write(Buffer.from(payload))
    // }
  }

  @SubscribeMessage('audioDataStop')
  stopData(): void {
    // this.audioInputStreamTransform.end()
  }

  @SubscribeMessage('clearText')
  clearText() {
    this.text = ''
  }

  @SubscribeMessage('transcribe')
  transcribe() {
    console.log("ee")
    const googleStream = this.speechToTextService.createStream()
    const fileStream = fs.createReadStream(this.testFilename).on(`end`, () => { console.log("end") })
    const converterStream = new Duplex({
      read(size) {
        console.log("Duplex read")
      },
      write(size) {
        console.log("Duplex read")
      }
    })
      .on(`end`, () => { console.log("Duplex end") })
      .on(`data`, (data) => { console.log("Duplex data", data) })
    // const convertedFile = fs.createWriteStream(path.join(
    //   process.cwd(),
    //   `converted.wav`
    // ))
    this.editorService.convertFileFfmpeg(fileStream, converterStream)
    // converterStream.pipe(convertedFile)
    // fileStream.pipe(googleStream)
  }

  @SubscribeMessage('convert')
  convert() {
    console.log("ee")
    const stream = this.speechToTextService.createStream()
    const fileStream = fs.createReadStream(this.testFilename).on(`end`, () => { console.log("end") })
    fileStream.pipe(stream)
  }

  private streamDataCallback(data: any) {
    console.log({ data })
    this.text += `${data}`
    this.server.emit('textData', this.text)
  }


}