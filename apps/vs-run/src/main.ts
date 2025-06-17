import { NestFactory } from '@nestjs/core';
import { VsRunModule } from './vs-run.module';

async function bootstrap() {
  const app = await NestFactory.create(VsRunModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
