import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common'
import { CreateGenreDto } from './dto'
import { UpdateGenreDto } from './dto'
import { GenreService } from './genre.service'

@Controller('genres')
export class GenreController {
    constructor(private readonly genreService: GenreService) {}
}
