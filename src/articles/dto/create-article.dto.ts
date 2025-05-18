import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content of the article' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The URL of the article image', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'The author of the article' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ description: 'The unique slug for the article' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
