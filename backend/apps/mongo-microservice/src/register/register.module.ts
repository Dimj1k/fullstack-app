import { Module } from '@nestjs/common'
import { RegisterController } from './register.controller'
import { RegisterService } from './register.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'

@Module({
    imports: [TypeOrmModule.forFeature([CacheUser])],
    controllers: [RegisterController],
    providers: [RegisterService],
})
export class RegisterModule {}
