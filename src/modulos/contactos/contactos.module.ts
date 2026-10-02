import { Module } from '@nestjs/common';
import { ContactoRepository } from './infraestructura/persistencia/repositorios/contacto.repository';
import { PrismaContactoRepository } from './infraestructura/persistencia/repositorios/prisma-contacto.repository';
import { ContactoMapper } from './infraestructura/mapeadores/contacto.mapper';
import { CrearContactoUseCase } from './aplicacion/casos-uso/crear-contacto.use-case';
import { CrearContactosMasivosUseCase } from './aplicacion/casos-uso/crear-contactos-masivos.use-case';
import { ListarContactosUseCase } from './aplicacion/casos-uso/listar-contactos.use-case';
import { ObtenerContactoUseCase } from './aplicacion/casos-uso/obtener-contacto.use-case';
import { ContactosController } from './presentacion/controladores/contactos.controller';

@Module({
  controllers: [ContactosController],
  providers: [
    // Infraestructura
    ContactoMapper,
    {
      provide: ContactoRepository,
      useClass: PrismaContactoRepository,
    },
    // Casos de uso
    CrearContactoUseCase,
    CrearContactosMasivosUseCase,
    ListarContactosUseCase,
    ObtenerContactoUseCase,
  ],
  exports: [ContactoRepository],
})
export class ContactosModule {}
