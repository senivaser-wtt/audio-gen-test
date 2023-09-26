import { Injectable, Optional } from '@nestjs/common'
import { v1p1beta1, v1 } from '@google-cloud/speech'
// import { SpeechClient } from '@google-cloud/speech/build/src/v1p1beta1'
import { Duplex, Writable } from 'stream'
import * as fs from 'fs'
import * as FfmpegCommand from 'fluent-ffmpeg'
import * as path from 'path'

@Injectable()
export class SpeechToTextService {
  private client: any
  private request: any

  public recognizeStream = null

  private restartCounter = 0
  private audioInput = []
  private lastAudioInput = []
  private resultEndTime = 0
  private isFinalEndTime = 0
  private finalRequestEndTime = 0
  private newStream = true
  private bridgingOffset = 0
  private lastTranscriptWasFinal = false

  constructor() {
    const encoding = 'LINEAR16'
    const sampleRateHertz = 48000
    const languageCode = 'en-US'

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    }

    this.request = {
      config,
      interimResults: true,
    }

    this.client = new v1p1beta1.SpeechClient()
  }

  createStream() {
    // Initiate (Reinitiate) a recognize stream
    const stream = this.client
      .streamingRecognize({ ...this.request })
      .on('error', (err: Error & Partial<{ code: number }>) => {
        if (err.code === 11) {
          console.log('API request error 11', err)
          // restartStream();
        } else {
          console.error('API request error ' + err)
        }
      })
      .on('data', (stream) => {
        console.log('data: ', stream.results[0].alternatives[0].transcript)
        // speechCallback(stream.results[0].alternatives[0].transcript)
      })
    return stream
  }

  writeStream(chunk: any) {
    if (this.recognizeStream) {
      console.log('write stream')
      // this.recognizeStream.write(chunk)
    }
  }

  endStream() {
    if (this.recognizeStream) {
      this.recognizeStream.end()
      this.recognizeStream = null
    }
  }
}
