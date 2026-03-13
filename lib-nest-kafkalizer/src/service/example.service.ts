import { ExampleDto } from '../dto/example.dto.js';
import { ExampleMapper } from '../mapper/example.mapper.js';

export class ExampleService {
  async process(dto: ExampleDto) {
    // Lógica de negocio ejemplo
    return ExampleMapper.toDto(dto);
  }
}
