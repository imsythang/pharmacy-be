import { Injectable, BadRequestException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import sanitize from 'sanitize-html';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('CALLBACK_URL')}/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'displayName'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any) => void,
  ): Promise<void> {
    const id = sanitize(profile?.id || '');
    const email = sanitize(profile?.emails?.[0]?.value || '');
    const displayName = sanitize(profile?.displayName || '');
    const name = profile?.name
      ? {
          givenName: sanitize(profile.name.givenName || ''),
          familyName: sanitize(profile.name.familyName || ''),
        }
      : undefined;

    if (!id || !email) {
      return done(
        new BadRequestException('Thông tin Facebook profile không hợp lệ'),
        null,
      );
    }

    const user = {
      id,
      email,
      displayName,
      name,
    };

    return done(null, user);
  }
}
