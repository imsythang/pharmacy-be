//auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as sanitizeHtml from 'sanitize-html';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log('🧠 Email và password trong validateUser:', email, password);
    const sanitizedEmail = sanitizeHtml(email);
    const user = await this.prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
    if (!user) {
      console.log('Không tìm thấy user!');
      return null;
    }
    if (!user.password) {
      console.log('❌ User không có password (có thể là tài khoản OAuth)');
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 [validateUser] So khớp mật khẩu:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Mật khẩu không hợp lệ!');
      return null;
    }
    if (user && user.password && isPasswordValid) {
      const { password: _, refreshToken, ...result } = user;
      console.log('Xác thực thành công');
      return result;
    }
    return null;
  }
  getMe(user: any) {
    const { password, refreshToken, ...safeUser } = user;
    return { user: safeUser };
  }
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // Kiểm tra email đã tồn tại
      const existing = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });
      if (existing) {
        throw new BadRequestException('Email đã được đăng ký');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      const result = await this.prisma.$transaction(async (prisma) => {
        // Tạo user mới
        const user = await prisma.user.create({
          data: {
            email: registerDto.email,
            password: hashedPassword,
            name: registerDto.name,
            role: 'USER',
          },
        });

        // Tạo cart cho user mới
        await prisma.cart.create({
          data: {
            userId: user.id,
          },
        });

        // Trả về user không bao gồm password và refreshToken
        const { password: _, refreshToken: __, ...safeUser } = user;
        return safeUser;
      });

      return result;
    } catch (error) {
      console.error('❌ [AuthService] Register error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Đăng ký thất bại');
    }
  }

  async oauthLogin(profile: any, provider: 'google' | 'facebook') {
    if (!profile?.id || !profile?.emails?.[0]?.value) {
      throw new BadRequestException('Thông tin OAuth không hợp lệ');
    }

    const sanitizedEmail = sanitizeHtml(profile.emails[0].value);
    const sanitizedName = sanitizeHtml(
      profile.displayName || profile.name?.givenName || 'User',
    );

    let user = await this.prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthId: profile.id,
      },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: sanitizedEmail,
            name: sanitizedName,
            oauthProvider: provider,
            oauthId: profile.id,
            role: 'USER',
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { email: sanitizedEmail },
          data: {
            oauthProvider: provider,
            oauthId: profile.id,
          },
        });
      }
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (
        !user ||
        !user.refreshToken ||
        !(await bcrypt.compare(refreshToken, user.refreshToken))
      ) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const newPayload = { email: user.email, sub: user.id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Update hashed refresh token
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
