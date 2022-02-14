import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users';
import { AuthModule } from './auth';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb/recru'),
    UsersModule,
    AuthModule,
    ConfigModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
