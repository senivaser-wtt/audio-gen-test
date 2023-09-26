import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // const app1 = await NestFactory.createMicroservice<Microser>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       host: '127.0.0.1',
  //       port: 8080,
  //     }
  //   }
  // )
  await app.listen(3000)
}
bootstrap()
