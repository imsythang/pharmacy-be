//auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request as ExpressRequest } from 'express';
import * as sanitizeHtml from 'sanitize-html';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ValidationError } from 'class-validator';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
    console.log('📥 [AuthController] Request body:', loginDto);
    console.log('📥 [AuthController] Request headers:', req.headers);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      console.log('❌ [AuthController] User validation failed');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    console.log('✅ [AuthController] User validated successfully');
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      console.log(
        '📥 [Register] Request body:',
        JSON.stringify(registerDto, null, 2),
      );

      // Validate input
      if (!registerDto.email || !registerDto.password || !registerDto.name) {
        console.log('❌ [Register] Missing required fields:', {
          hasEmail: !!registerDto.email,
          hasPassword: !!registerDto.password,
          hasName: !!registerDto.name,
        });
        throw new BadRequestException('Vui lòng điền đầy đủ thông tin');
      }

      // Sanitize input
      const sanitizedDto = {
        email: sanitizeHtml(registerDto.email),
        password: registerDto.password, // Không sanitize password
        name: sanitizeHtml(registerDto.name),
      };

      console.log(
        '📥 [Register] Sanitized data:',
        JSON.stringify(sanitizedDto, null, 2),
      );

      // Gọi service để đăng ký
      const result = await this.authService.register(sanitizedDto);
      console.log('✅ [Register] Success:', JSON.stringify(result, null, 2));

      // Tạo token và trả về kết quả
      const tokens = await this.authService.login(result);
      return {
        ...result,
        ...tokens,
      };
    } catch (error) {
      console.error('❌ [Register] Error:', error);

      // Log chi tiết lỗi validation
      if (error instanceof ValidationError) {
        console.error('❌ [Register] Validation error:', {
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        });
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.constraints,
        });
      }

      // Log chi tiết lỗi từ service
      if (error instanceof BadRequestException) {
        console.error('❌ [Register] Bad request:', error.message);
        throw error;
      }

      // Log chi tiết lỗi không xác định
      console.error('❌ [Register] Unknown error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      throw new BadRequestException(
        error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.',
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người dùng' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async getCurrentUser(@Request() req: ExpressRequest) {
    return this.authService.login(req.user);
  }

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google will redirect to callback
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.oauthLogin(
      req.user,
      'google',
    );
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.redirect('http://localhost:3000/auth/callback');
  }

  @Get('facebook')
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Facebook will redirect to callback
  }

  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.oauthLogin(
      req.user,
      'facebook',
    );
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.redirect('http://localhost:3000/auth/callback');
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'Logout successful' });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req: ExpressRequest, @Res() res: Response) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    const result = await this.authService.refreshToken(refreshToken);
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: 'Token refreshed' });
  }
}
