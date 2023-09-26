import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AudioGateway } from './audio.gateway'
import { SpeechToTextService } from './speech-to-text.service'
import { EditorService } from './editor.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AudioGateway, SpeechToTextService, EditorService],
})
export class AppModule { }
