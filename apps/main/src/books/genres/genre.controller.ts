import {
    Body,
    Controller,
    Delete,
    Get,
    Put,
    Post,
    Query,
    UseFilters,
    Ip,
} from '@nestjs/common'
import { CreateGenreDto } from './dto'
import { UpdateGenreDto } from './dto'
import { GenreService } from './genre.service'
import { OnlyHttpExceptionFilter } from '../../shared/filters'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { FindGenreDto } from './dto/find-genre.dto'
import { DeleteGenreDto } from './dto/delete-genre.dto'
import { sleep } from '../../shared/utils'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AdminResources } from '../../shared/decorators'

@ApiTags('genres')
@UseFilters(new OnlyHttpExceptionFilter())
@Controller('genres')
export class GenreController {
    private readonly ips = new Map<string, { count: number; date: number }>() //\\

    constructor(private readonly genreService: GenreService) {}

    @AdminResources()
    @Post('create')
    async create(@Body() genre: CreateGenreDto) {
        return this.genreService.create(genre)
    }

    @Get('find')
    async find(@Query() { genreName, take }: FindGenreDto, @Ip() ip: string) {
        if (!this.ips.has(ip))
            this.ips.set(ip, {
                count: 1,
                date: Date.now(),
            })
        else {
            let { count } = this.ips.get(ip)
            this.ips.set(ip, { count: ++count, date: Date.now() })
            if (count > 100) await sleep(100)
        }
        return this.genreService.find(genreName, take)
    }

    @AdminResources()
    @Put('update')
    async update(@Body() { id, newGenreName }: UpdateGenreDto) {
        return this.genreService.update(id, newGenreName)
    }

    @AdminResources()
    @Delete('delete')
    async delete(@Body() { id }: DeleteGenreDto) {
        return this.genreService.delete(id)
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    protected async deleteOldIp() {
        const now = Date.now()
        for (let [ip, value] of this.ips.entries()) {
            if (value.date + 9950 > now) this.ips.delete(ip)
        }
    }
}
