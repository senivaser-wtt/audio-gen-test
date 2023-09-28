import { Injectable } from "@nestjs/common"
import * as FfmpegCommand from 'fluent-ffmpeg'
import { EventEmitter, Readable, Writable } from "stream"

@Injectable()
export class EditorService {

  private queueEmitter: EventEmitter = new EventEmitter()
  private queue: { buffer: Buffer, output: Writable }[] = []

  constructor() {
    this.queueEmitter.on('next', () => {
      if (this.queue.length > 0) {
        this.nextInQueue()
      }
    })
  }

  addToQueue(buffer: Buffer, output: Writable) {
    this.queue.push({ buffer, output })
    if (this.queue.length === 1) {
      this.queueEmitter.emit('next')
    }
  }

  private nextInQueue() {
    const { buffer, output } = this.queue[0]
    try {
      this.convertFileFfmpeg(buffer).pipe(output, { end: false })
    } catch (error) {
      console.log(error)
    }
  }

  private convertFileFfmpeg(buffer: Buffer): FfmpegCommand.FfmpegCommand {
    const ffmpeg = FfmpegCommand(Readable.from(buffer))
    return ffmpeg
      .format('wav')
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('data', (data) => {
        console.log('Processing: ' + data)
      })
      .on('error', (err, stdout, stderr) => {
        console.log('Cannot process video: ' + err.message)
      })
      .on('end', (stdout, stderr) => {
        console.log('Transcoding succeeded !')
        this.queue.shift()
        this.queueEmitter.emit('next')
      })
  }
}