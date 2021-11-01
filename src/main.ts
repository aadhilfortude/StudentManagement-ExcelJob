import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: '*',
    origin: Config.cors.origin,
    credentials: true
  });
  
  await app.listen(Config.cors.port);
}
bootstrap();
