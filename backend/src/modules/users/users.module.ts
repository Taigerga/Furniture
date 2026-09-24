import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ActivityService],
})
export class UsersModule {}
