import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { FiltroExcepcionesGlobal } from 'compartido/errores/filtro-excepciones-global';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Parche para que BigInt se serialice a JSON correctamente como string
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors();

  // Configurar el prefijo global /api
  app.setGlobalPrefix('api');

  // Validación global de DTOs mediante class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de excepciones — respuestas de error consistentes
  app.useGlobalFilters(new FiltroExcepcionesGlobal());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Central - Validador de Contactos')
    .setDescription('API REST para la validación masiva de contactos de WhatsApp.')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
    .addApiKey({ type: 'apiKey', name: 'X-API-SECRET', in: 'header' }, 'X-API-SECRET')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);

  console.log(`🚀 API Central ejecutándose en: http://localhost:${puerto}`);
  console.log(`📚 Documentación Swagger en: http://localhost:${puerto}/api/docs`);
}

bootstrap();
