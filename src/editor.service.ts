import { Injectable } from "@nestjs/common"
import * as FfmpegCommand from 'fluent-ffmpeg'
import { Readable, Writable } from "stream"

@Injectable()
export class EditorService {

  constructor() {

  }

  async convertFileFfmpeg(buffer: Buffer, outputStream: Writable): Promise<void> {

    return new Promise((resolve, reject) => {
      const ffmpeg = FfmpegCommand(Readable.from(buffer))
      ffmpeg
        .format('wav')
        .on('start', (commandLine) => {
          console.log('Spawned Ffmpeg with command: ' + commandLine)
        })
        .on('data', (data) => {
          console.log('Processing: ' + data)
        })
        .on('error', (err, stdout, stderr) => {
          console.log('Cannot process video: ' + err.message)
          reject(err)
        })
        .on('end', (stdout, stderr) => {
          console.log('Transcoding succeeded !')
          resolve()
        })
        .pipe(outputStream, { end: false })
    })

  }

}