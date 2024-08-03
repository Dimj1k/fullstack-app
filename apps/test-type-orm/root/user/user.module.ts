import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../entities/user/user.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CreateUserService } from './create-user.service'
import { MyMailerService } from '../mailer/mailer.service'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [UserController],
    providers: [CreateUserService, UserService, MyMailerService],
    // exports: [TypeOrmModule],
})
export class UserModule {}
