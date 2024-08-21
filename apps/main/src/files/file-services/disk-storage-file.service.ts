import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'path'
import * as sharp from 'sharp'
import { convertToWebP } from './convert-to-webp.utils'
import { ResizeOptions } from './interfaces'

@Injectable()
export class DiskStorageFilesService {
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
        let { path, filename: filenameWithDir } = image
        let [{ dir: originalDir, name }, { dir: dateDir }] = [
            parse(path),
            parse(filenameWithDir),
        ]
        return convertToWebP(
            path,
            name,
            { originalDir, dateDir },
            sizes,
            options,
            webpOptions,
        )
    }
}
