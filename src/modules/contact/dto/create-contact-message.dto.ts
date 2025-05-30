import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  firstName: string;

  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(1, { message: 'Message is required' })
  message: string;
}
