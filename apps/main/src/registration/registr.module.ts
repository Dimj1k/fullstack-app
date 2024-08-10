import { Module } from '@nestjs/common'
import { RegistrController } from './registr.controller'
import { RegistrService } from './registr.service'
import { UserService } from '../user'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../entities/user'
import { Mailer } from '../mailer'

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
