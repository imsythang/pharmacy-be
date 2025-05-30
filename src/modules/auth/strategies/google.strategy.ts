// google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('CALLBACK_URL')}/google/callback`,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    console.log('Google Profile:', profile);
    const email = profile?.emails?.[0]?.value;
    const id = profile?.id;
    const displayName = profile?.displayName;
    if (!id || !email) {
      return done(
        new UnauthorizedException('Thông tin OAuth không hợp lệ'),
        false,
      );
    }
    return done(null, profile);
  }
}
