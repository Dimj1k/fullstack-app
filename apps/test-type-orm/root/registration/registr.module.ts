import { Module } from '@nestjs/common'
import { RegistrController } from './registr.controller'
import { RegistrService } from './registr.service'
import { UserService } from '../user/user.service'
import { MyMailerService } from '../mailer/mailer.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../entities/user/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [RegistrController],
    providers: [RegistrService, UserService, MyMailerService],
    exports: [],
})
export class RegistrModule {}
