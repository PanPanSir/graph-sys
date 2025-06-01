import { NestFactory } from '@nestjs/core';
import { VsAdapterModule } from './vs-adapter.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(VsAdapterModule);
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(process.env.port ?? 4000);
}
bootstrap();
