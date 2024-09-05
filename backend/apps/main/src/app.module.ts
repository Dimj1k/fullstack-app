import { MailerModule } from '@nestjs-modules/mailer'
import { NestModule, MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminModule } from './administration'
import { AuthModule, PUBLIC_KEY } from './auth'
import { BooksModule, BooksController } from './books'
import { XmlParserMiddleware } from './shared/middlewares'
import { RegistrModule } from './registration'
import { UserModule } from './user'
import { UserBookModule } from './user-book'
import { GlobalWrapperModules } from './global-wrapper.module'
import { UserProblemsModule } from './user-problems/user-problems.module'
import { FilesModule } from './files'
import { ormConfig } from './orm-config'

@Module({
    imports: [
        GlobalWrapperModules,
        UserProblemsModule,
        AuthModule,
        FilesModule,
        JwtModule.register({
            global: true,
            publicKey: PUBLIC_KEY,
            verifyOptions: { ignoreExpiration: false, algorithms: ['RS256'] },
        }),
        UserBookModule,
        AdminModule,
        RegistrModule,
        BooksModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: ormConfig,
        }),
        UserModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: `smtps://${config.get('USER_SMTP')}:${config.get('PASSWORD_SMTP')}@${config.get('SMTP_SERVER')}:465`,
            }),
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(XmlParserMiddleware).forRoutes('*')
    }
}
