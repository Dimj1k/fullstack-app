import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MONGO_NAME, POSTGRES_NAME } from '~constants/names_db.constant'
import { POSTGRES_ENTITIES } from '~entities/pg'
import { MONGO_ENTITIES } from '~entities/mongo'
import { UserModule } from './user/user.module'
import { POSTGRES_SUBSCRIBERS } from './subscribers'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            name: POSTGRES_NAME,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    name: POSTGRES_NAME,
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
        TypeOrmModule.forRootAsync({
            name: MONGO_NAME,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    name: MONGO_NAME,
                    type: 'mongodb',
                    host: config.get('MONGO_DB_HOST'),
                    port: config.get('MONGO_DB_PORT'),
                    database: config.get<string>('MONGO_DB_DATABASE'),
                    logger: 'debug',
                    entities: MONGO_ENTITIES,
                    synchronize: true,
                    logging: 'all',
                    autoLoadEntities: true,
                }
            },
        }),
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
