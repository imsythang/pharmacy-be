import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'The ID of the category this product belongs to',
  })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'The URL of the product image' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
