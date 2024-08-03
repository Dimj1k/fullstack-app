import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ENTITIES } from './register/register.entity'
import { RegisterModule } from './register/register.module'
import { AuthModule } from './auth/auth.module'

@Module({
    imports: [
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
