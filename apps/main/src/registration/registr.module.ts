import { Module } from '@nestjs/common'
import { RegistrController } from './registr.controller'
import { RegistrService } from './registr.service'
import { UserService } from '../user'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../shared/entities/user'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [RegistrController],
    providers: [RegistrService, UserService],
    exports: [],
})
export class RegistrModule {}
