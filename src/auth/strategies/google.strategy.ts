// google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

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
    const email = profile?.emails?.[0]?.value;
    const id = profile?.id;
    const displayName = profile?.displayName;

    if (!id || !email) {
      return done(
        new UnauthorizedException('Thông tin OAuth không hợp lệ'),
        null,
      );
    }

    const user = {
      id,
      email,
      displayName,
      provider: 'google',
    };

    return done(null, user);
  }
}
