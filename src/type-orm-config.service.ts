import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './auth/user.entity';
import { Profile } from './profile/profile.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // For Heroku Postgres
    if (this.configService.get<string>('DATABASE_URL')) {
      return {
        type: 'postgres',
        url: this.configService.get<string>('DATABASE_URL'),
        entities: [User, Profile],
        synchronize: true,
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      };
    }

    // For anything else
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', '127.0.0.1'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USER', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'password'),
      database: this.configService.get<string>('DB_DATABASE', 'joinme'),
      entities: [User, Profile],
      synchronize: true,
    };
  }
}
