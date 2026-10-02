import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infraestructura/prisma/prisma.module';
import { ContactosModule } from './modulos/contactos/contactos.module';
import { ValidacionesModule } from './modulos/validaciones/validaciones.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { EstadisticasModule } from './modulos/estadisticas/estadisticas.module';
import { HealthController } from './compartido/health/health.controller';
import { AuthModule } from './modulos/auth/auth.module';

@Module({
  imports: [
    // Configuración global — carga variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Infraestructura global
    PrismaModule,

    // Módulos de negocio
    ContactosModule,
    ValidacionesModule,
    ClientesModule,
    EstadisticasModule,
    AuthModule,
  ],
  // Health endpoint: no requiere módulo propio, accede a PrismaService globalmente
  controllers: [HealthController],
})
export class AppModule {}
