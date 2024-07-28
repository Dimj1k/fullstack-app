import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '~entities/pg/user.entity'
import { POSTGRES_NAME } from '~constants/names_db.constant'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo], POSTGRES_NAME)],
    controllers: [UserController],
    providers: [UserService],
    // exports: [TypeOrmModule],
})
export class UserModule {}
