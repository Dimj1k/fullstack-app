import { BadRequestException, Injectable } from '@nestjs/common'
import { map } from 'async'
import { format } from 'date-fns'
import { ensureDir, writeFile } from 'fs-extra'
import { basename, join, parse } from 'path'
import * as sharp from 'sharp'
import { uploadDir } from '../../shared/constants'
import { convertToWebP } from './convert-to-webp.utils'
import { ResizeOptions } from './interfaces'

@Injectable()
export class MemoryStorageFilesService {
    private readonly uploadDirectory = uploadDir

    async convertImageToWebp(
        image: Express.Multer.File,
        sizes?: Omit<{ [key in string]: ResizeOptions }, 'default'>,
        options: sharp.SharpOptions = {},
        webpOptions: sharp.WebpOptions = {},
    ) {
        if (!image.mimetype.includes('image'))
            throw new BadRequestException(
                `${image.originalname} - не изображение`,
            )
        let dateDir = format(new Date(), 'dd-MM-yyyy')
        let originalDir = join(uploadDir, dateDir)
        await ensureDir(originalDir)
        let name = `${Date.now()}-${image.originalname}`
        // await this.uploadFile(image, originalDir, name)
        name = parse(name).name
        return convertToWebP(
            image.buffer,
            name,
            { originalDir, dateDir },
            sizes,
            options,
            webpOptions,
        )
    }

    private async uploadFile(
        file: Express.Multer.File,
        dir: string = join(uploadDir, format(new Date(), 'dd-MM-yyyy')),
        nameFile?: string,
    ) {
        if (!nameFile) nameFile = file.originalname
        return ensureDir(dir).then(async () => {
            let filename = join(dir, nameFile)
            writeFile(filename, file.buffer, { flush: true }).then(() =>
                join(basename(dir), nameFile),
            )
        })
    }
}
