import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user/user.entity'
import { readFileSync } from 'fs'
import { join } from 'path'

export const PUBLIC_KEY = __dirname.includes('auth')
    ? readFileSync(join(__dirname, 'key', 'public-key.pem'))
    : readFileSync(join(__dirname, 'auth', 'key', 'public-key.pem'))

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
