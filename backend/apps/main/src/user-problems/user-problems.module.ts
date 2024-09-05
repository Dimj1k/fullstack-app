import { Module } from '@nestjs/common'
import { UserProblemsController } from './user-problems.controller'
import { UserProblemsService } from './user-problems.service'
import { UserService } from '../user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../shared/entities/user'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [UserProblemsController],
    providers: [UserProblemsService, UserService],
    exports: [],
})
export class UserProblemsModule {}
