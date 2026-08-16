import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());   // we can use it anywhere in our project
	app.useGlobalInterceptors(new LoggingInterceptor())  // logging stanard time before and after
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
