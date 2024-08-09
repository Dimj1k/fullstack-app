import { Module } from '@nestjs/common'
import { RegistrController } from './registr.controller'
import { RegistrService } from './registr.service'
import { UserService } from '../user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../entities/user/user.entity'
import { Mailer } from '../mailer/mailer.service'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [RegistrController],
    providers: [
        RegistrService,
        UserService,
        { provide: 'Mailer', useClass: Mailer },
    ],
    exports: [],
})
export class RegistrModule {}
