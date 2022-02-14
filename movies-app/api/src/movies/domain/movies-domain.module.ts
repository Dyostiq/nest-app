import { Module } from '@nestjs/common';
import { BasicUserPolicy } from './basic-user.policy';
import { PremiumUserPolicy } from './premium-user.policy';
import { MovieCollectionFactory } from './movie-collection.factory';

@Module({
  providers: [BasicUserPolicy, PremiumUserPolicy, MovieCollectionFactory],
  exports: [MovieCollectionFactory],
})
export class MoviesDomainModule {}
