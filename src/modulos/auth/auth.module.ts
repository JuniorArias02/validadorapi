import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentacion/controladores/auth.controller';
import { AuthService } from './aplicacion/servicios/auth.service';
import { PrismaService } from 'infraestructura/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secreto-seguro',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService]
})
export class AuthModule {}
