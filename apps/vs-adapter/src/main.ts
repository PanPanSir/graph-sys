import { NestFactory } from '@nestjs/core';
import { VsAdapterModule } from './vs-adapter.module';

async function bootstrap() {
  const app = await NestFactory.create(VsAdapterModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
