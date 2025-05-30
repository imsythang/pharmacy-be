import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(createContactMessageDto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: createContactMessageDto,
    });
  }
}
