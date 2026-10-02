import { Body, Controller, HttpCode, HttpStatus, Post, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../../aplicacion/servicios/auth.service';
import { LoginDto } from '../../aplicacion/dto/login.dto';
import { RespuestaApi, respuestaExitosa } from 'compartido/respuestas/respuesta-api';
import { JwtAuthGuard } from '../../infraestructura/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<RespuestaApi> {
    const data = await this.authService.login(loginDto);
    return respuestaExitosa('Login exitoso', data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any): RespuestaApi {
    return respuestaExitosa('Sesión activa', req.user);
  }
}
