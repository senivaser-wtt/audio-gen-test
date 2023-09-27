import { Injectable } from "@nestjs/common"
import * as FfmpegCommand from 'fluent-ffmpeg'
import { Readable, Writable } from "stream"

@Injectable()
export class EditorService {

  constructor() {

  }

  convertFileFfmpeg(buffer: Buffer): FfmpegCommand.FfmpegCommand {
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
      })
  }
}