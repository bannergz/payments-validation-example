export class ExampleMapper {
  static toDto(data: any) {
    return {
      id: data.id,
      value: data.value,
    };
  }

  static fromDto(dto: any) {
    return {
      id: dto.id,
      value: dto.value,
    };
  }
}
