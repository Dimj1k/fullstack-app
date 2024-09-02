import { ConfigService } from '@nestjs/config'
import { POSTGRES_ENTITIES } from './shared/entities'
import { POSTGRES_SUBSCRIBERS } from './shared/subscribers'
import { PopularGenresView, GenreAgeView } from './shared/view-entities'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { join } from 'path'
dotenv.config()

export default new DataSource({
    type: process.env.TYPEORM_DRIVER as 'postgres',
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [...POSTGRES_ENTITIES, PopularGenresView, GenreAgeView],
    synchronize: false,
    subscribers: POSTGRES_SUBSCRIBERS,
    migrations: [
        join(
            __dirname,
            '..',
            '..',
            '..',
            'database',
            'migrations',
            '/*.{ts,js}',
        ),
    ],
    migrationsTableName: 'migration_table',
    // migrationsRun: true,
    extra: {
        options: '-c lock_timeout=1000ms -c statement_timeout=1200ms',
    },
})

export const ormConfig = (config: ConfigService): TypeOrmModuleOptions => ({
    type: config.get<'postgres'>('TYPEORM_DRIVER'),
    host: config.get('TYPEORM_HOST'),
    port: config.get('TYPEORM_PORT'),
    username: config.get('TYPEORM_USERNAME'),
    password: config.get('TYPEORM_PASSWORD'),
    database: config.get<string>('TYPEORM_DATABASE'),
    entities: [...POSTGRES_ENTITIES, PopularGenresView, GenreAgeView],
    synchronize: false,
    subscribers: POSTGRES_SUBSCRIBERS,
    extra: {
        options: '-c lock_timeout=1000ms -c statement_timeout=1200ms',
    },
})
