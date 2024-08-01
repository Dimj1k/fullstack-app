import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../entities/user/user.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CreateUserService } from './create-user.service'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [UserController],
    providers: [CreateUserService, UserService],
    // exports: [TypeOrmModule],
})
export class UserModule {}
