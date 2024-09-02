import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { CreateGenreDto } from './dto'
import { UpdateGenreDto } from './dto'
import { Like, Repository } from 'typeorm'
import { Genre } from '../../shared/entities/genres'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class GenreService {
    constructor(
        @InjectRepository(Genre)
        private readonly genreRepository: Repository<Genre>,
    ) {}

    async create(genre: CreateGenreDto) {
        const newGenre = this.genreRepository.create(genre)
        return this.genreRepository.insert(newGenre).catch((err) => {
            throw new BadRequestException(err)
        })
    }

    async find(genreName: string, take: number = 10) {
        return this.genreRepository
            .find({
                where: { genre: Like(`%${genreName}%`) },
                select: ['genre'],
                take,
                order: { id: 'ASC' },
            })
            .then(async (genres) => genres.map(({ genre }) => genre))
            .catch((err) => {
                throw new HttpException(err, 500)
            })
    }

    async update(id: number, newGenreName: string) {
        return this.genreRepository
            .update({ id }, { genre: newGenreName })
            .catch((err) => {
                throw new BadRequestException(err)
            })
    }

    async delete(id: number) {
        return this.genreRepository.delete({ id }).catch((err) => {
            throw new BadRequestException(err)
        })
    }
}
