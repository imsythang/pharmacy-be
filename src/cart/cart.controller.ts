import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về giỏ hàng' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Thêm thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async addToCart(
    @Request() req: any,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.addToCart(req.user.id, createCartItemDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async updateCart(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCart(id, req.user.id, updateCartItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async removeFromCart(@Param('id') id: string, @Request() req: any) {
    return this.cartService.removeFromCart(id, req.user.id);
  }
}
