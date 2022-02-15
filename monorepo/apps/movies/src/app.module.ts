import { Module } from '@nestjs/common';
import { MoviesModule } from './movies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { dbConfig } from './db.config';
import { addMovieCollections1614157572162 } from './migrations/1614157572162-add-movie-collections';
import { referenceDetailsAndMovie1614172929745 } from './migrations/1614172929745-reference-details-and-movie';
import { BullModule } from '@nestjs/bull';
import { UserStatusModule } from './user-status/user-status.module';

@Module({
  imports: [
    MoviesModule,
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    UserStatusModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(dbConfig)],
      useFactory: (config: ConfigType<typeof dbConfig>) => ({
        type: 'postgres',
        host: config.host,
        port: 5432,
        password: config.password,
        username: config.user,
        autoLoadEntities: true,
        migrations: [
          addMovieCollections1614157572162,
          referenceDetailsAndMovie1614172929745,
        ],
        migrationsRun: true,
      }),
      inject: [dbConfig.KEY],
    }),
  ],
})
export class AppModule {}
