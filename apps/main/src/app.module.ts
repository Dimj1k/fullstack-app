import { MailerModule } from '@nestjs-modules/mailer'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule, PUBLIC_KEY } from './auth/auth.module'
import { BooksController } from './books/books.controller'
import { BooksModule } from './books/books.module'
import { POSTGRES_ENTITIES } from './entities'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { RegistrModule } from './registration/registr.module'
import { POSTGRES_SUBSCRIBERS } from './subscribers'
import { UserModule } from './user/user.module'
import { MailerInterceptor } from './interceptors/mailer.interceptor'
import { Mailer } from './mailer/mailer.service'

@Module({
    imports: [
        RegistrModule,
        BooksModule,
        AuthModule,
        JwtModule.register({
            global: true,
            publicKey: PUBLIC_KEY,
            verifyOptions: { ignoreExpiration: false, algorithms: ['RS256'] },
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: config.get<'postgres'>('TYPEORM_DRIVER'),
                    host: config.get('TYPEORM_HOST'),
                    port: config.get('TYPEORM_PORT'),
                    username: config.get('TYPEORM_USERNAME'),
                    password: config.get('TYPEORM_PASSWORD'),
                    database: config.get<string>('TYPEORM_DATABASE'),
                    entities: POSTGRES_ENTITIES,
                    logging: 'all',
                    synchronize: true,
                    logger: 'debug',
                    subscribers: POSTGRES_SUBSCRIBERS,
                    autoLoadEntities: true,
                    migrationsTableName: 'migration_table',
                }
            },
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
        consumer.apply(LoggerMiddleware).forRoutes(BooksController)
    }
}
