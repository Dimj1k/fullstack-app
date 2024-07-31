import { ConfigModule, ConfigService } from '@nestjs/config'
import { ENTITIES } from './register/register.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { RegisterModule } from './register/register.module'

@Module({
    imports: [
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
