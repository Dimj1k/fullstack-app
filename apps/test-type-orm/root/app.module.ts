import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { POSTGRES_SUBSCRIBERS } from './subscribers'
import { POSTGRES_ENTITIES } from './entities'

@Module({
    imports: [
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
                }
            },
        }),
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [ConfigModule],
})
export class AppModule {}
