import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { Token } from './token.entity'
import { readFileSync } from 'fs'
import { join } from 'path'
import { TypeOrmModule } from '@nestjs/typeorm'

const SECRET_KEY = readFileSync(
    join(__dirname, 'auth', 'keys', 'secret-key.pem'),
)

@Module({
    imports: [
        JwtModule.register({
            privateKey: SECRET_KEY,
            signOptions: { expiresIn: '300s', algorithm: 'RS256' },
        }),
        TypeOrmModule.forFeature([Token]),
    ],
    controllers: [AuthController],
    providers: [],
    exports: [],
})
export class AuthModule {}
