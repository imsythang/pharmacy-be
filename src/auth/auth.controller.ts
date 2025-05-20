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
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req: ExpressRequest, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    console.log("📥 Body FE gửi lên:", registerDto);
    const sanitizedDto = {
      email: sanitizeHtml(registerDto.email),
      password: registerDto.password,
      name: sanitizeHtml(registerDto.name),
    };
    return this.authService.register(sanitizedDto);
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
