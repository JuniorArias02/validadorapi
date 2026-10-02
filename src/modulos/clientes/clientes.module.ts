import { Module } from '@nestjs/common';
import { ListarClientesUseCase } from './aplicacion/casos-uso/listar-clientes.use-case';
import { RegistrarLatidoUseCase } from './aplicacion/casos-uso/registrar-latido.use-case';
import { ClientesController } from './presentacion/controladores/clientes.controller';

@Module({
  controllers: [ClientesController],
  providers: [ListarClientesUseCase, RegistrarLatidoUseCase],
})
export class ClientesModule {}
