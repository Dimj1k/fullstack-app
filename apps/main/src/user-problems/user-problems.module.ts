import { Module } from '@nestjs/common'
import { UserProblemsController } from './user-problems.controller'
import { UserProblemsService } from './user-problems.service'
import { UserService } from '../user/user.service'
import { Mailer } from '../mailer'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, UserInfo } from '../shared/entities/user'

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInfo])],
    controllers: [UserProblemsController],
    providers: [
        UserProblemsService,
        UserService,
        { provide: 'Mailer', useClass: Mailer },
    ],
    exports: [],
})
export class UserProblemsModule {}
