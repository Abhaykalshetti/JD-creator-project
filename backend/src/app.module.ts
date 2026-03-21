import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JdModule } from './jd/jd.module';
import { JobDescription } from './jd/entities/jd.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [JobDescription, User],
        synchronize: true, // Should be true for Neon DB sync as requested
        keepConnectionAlive: true,
        extra: {
          max: 15,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 20000, // Increased for Neon cold start
          ssl: {
            rejectUnauthorized: false,
          },
        },
        ssl: {
          rejectUnauthorized: false,
        },
        logging: false,
      }),
    }),
    JdModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
