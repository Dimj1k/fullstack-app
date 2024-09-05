import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth'
import { ENTITIES, RegisterModule } from './register'
import { TempUrlModule } from './temp-url/temp-url.module'

@Module({
    imports: [
        TempUrlModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: 'mongodb',
                    host: config.get('MONGO_DB_HOST'),
                    port: config.get('MONGO_DB_PORT'),
                    database: config.get('MONGO_DB_DATABASE'),
                    logger: 'debug',
                    entities: ENTITIES,
                    synchronize: true,
                    logging: 'all',
                    autoLoadEntities: true,
                }
            },
        }),
        RegisterModule,
    ],
})
export class AppModule {}
