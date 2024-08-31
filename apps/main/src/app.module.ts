import { MailerModule } from '@nestjs-modules/mailer'
import { NestModule, MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminModule } from './administration'
import { AuthModule, PUBLIC_KEY } from './auth'
import { BooksModule, BooksController } from './books'
import { POSTGRES_ENTITIES } from './shared/entities'
import { XmlParserMiddleware } from './shared/middlewares'
import { RegistrModule } from './registration'
import { POSTGRES_SUBSCRIBERS } from './shared/subscribers'
import { UserModule } from './user'
import { UserBookModule } from './user-book'
import { GlobalWrapperModules } from './global-wrapper.module'
import { UserProblemsModule } from './user-problems/user-problems.module'
import { FilesModule } from './files'
import { PopularGenresView } from './shared/view-entities/popular-genres.view'
import { GenreAgeView } from './shared/view-entities'

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
            useFactory: (config: ConfigService) => {
                return {
                    type: config.get<'postgres'>('TYPEORM_DRIVER'),
                    host: config.get('TYPEORM_HOST'),
                    port: config.get('TYPEORM_PORT'),
                    username: config.get('TYPEORM_USERNAME'),
                    password: config.get('TYPEORM_PASSWORD'),
                    database: config.get<string>('TYPEORM_DATABASE'),
                    entities: [
                        ...POSTGRES_ENTITIES,
                        PopularGenresView,
                        GenreAgeView,
                    ],
                    logging: 'all',
                    synchronize: true,
                    logger: 'debug',
                    subscribers: POSTGRES_SUBSCRIBERS,
                    autoLoadEntities: true,
                    migrationsTableName: 'migration_table',
                    extra: {
                        options:
                            '-c lock_timeout=1000ms -c statement_timeout=1200ms',
                    },
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
        consumer.apply(XmlParserMiddleware).forRoutes('*')
    }
}
