import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Số lượng sản phẩm' })
  @IsInt()
  @Min(1)
  quantity: number;
}
