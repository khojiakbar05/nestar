import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe()); // we can use it anywhere in our project
	app.useGlobalInterceptors(new LoggingInterceptor()); // logging stanard time before and after
	app.enableCors({ origin: true, credentials: true }); // ixtiyoriy domaindan requestlarni serverimiz qabul qilyapti

	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 })); // yuklanyapkan filega limit qoyish
	app.use('/uploads', express.static('./uploads')); // shu folderni ommaga ochiqlab beryapmiz

	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
