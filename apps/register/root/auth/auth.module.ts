import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { Token } from './token.entity'
import { readFileSync } from 'fs'
import { join } from 'path'
import { TypeOrmModule } from '@nestjs/typeorm'

const SECRET_KEY = readFileSync(
    join(__dirname, 'auth', 'keys', 'secret-key.pem'),
)

const PUBLIC_KEY = readFileSync(
    join(__dirname, 'auth', 'keys', 'public-key.pem'),
)

@Module({
    imports: [
        JwtModule.register({
            privateKey: SECRET_KEY,
            publicKey: PUBLIC_KEY,
            signOptions: { expiresIn: '300s', algorithm: 'RS256' },
        }),
        PassportModule,
        TypeOrmModule.forFeature([Token]),
    ],
    controllers: [AuthController],
    providers: [],
    exports: [],
})
export class AuthModule {}
