import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'infraestructura/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { usuario: loginDto.usuario }
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValido = await bcrypt.compare(loginDto.password, usuario.passwordHash);
    if (!passwordValido) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = { sub: usuario.id.toString(), usuario: usuario.usuario, nombre: usuario.nombre };
    
    return {
      token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        usuario: usuario.usuario
      }
    };
  }
}
