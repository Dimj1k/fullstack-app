import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user'
import { readFileSync } from 'fs'
import { join } from 'path'

export const PUBLIC_KEY = readFileSync(
    join(
        __dirname,
        __dirname.includes('auth') ? '..' : '.',
        'auth',
        'key',
        'public-key.pem',
    ),
)

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
