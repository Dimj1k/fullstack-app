import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { readFileSync } from 'fs'
import { join } from 'path'
import { JwtStrategy } from './strategy/jwt.strategy'
import { PassportModule } from '@nestjs/passport'

export const PUBLIC_KEY = readFileSync(
    join(__dirname, 'auth', 'key', 'public-key.pem'),
)

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            global: true,
            publicKey: PUBLIC_KEY,
            verifyOptions: { ignoreExpiration: false, algorithms: ['RS256'] },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [],
})
export class AuthModule {}
