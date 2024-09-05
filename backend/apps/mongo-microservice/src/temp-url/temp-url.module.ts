import { Module } from '@nestjs/common'
import { TempUrlController } from './temp-url.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TempUrl } from './temp-url.entity'

@Module({
    imports: [TypeOrmModule.forFeature([TempUrl])],
    controllers: [TempUrlController],
    providers: [],
    exports: [],
})
export class TempUrlModule {}
