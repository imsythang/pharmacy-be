import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Số lượng sản phẩm' })
  @IsInt()
  @Min(1)
  quantity: number;
}
