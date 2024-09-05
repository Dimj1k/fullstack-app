import { reduce } from 'async'
import { basename, join } from 'path'
import * as sharp from 'sharp'
import { ResizeOptions } from './interfaces'

export async function convertToWebP(
    pathOrBuffer: string | Buffer,
    name: string,
    { originalDir, dateDir }: { originalDir: string; dateDir: string },
    sizes?: Omit<{ [key in string]: ResizeOptions }, 'default'>,
    options?: sharp.SharpOptions,
    webpOptions?: sharp.WebpOptions,
) {
    if (sizes && typeof sizes === 'object') {
        sizes.default = null
        return reduce(
            Object.entries(sizes),
            {},
            async (memo, [key, size]: [string, ResizeOptions]) => {
                let fileName = join(
                    originalDir,
                    size
                        ? `${name}-${size.height}x${size.width}.webp`
                        : `${name}.webp`,
                )
                return sharp(pathOrBuffer, options)
                    .resize(size)
                    .webp(webpOptions)
                    .toFile(fileName)
                    .then(
                        () => (memo[key] = dateDir + '/' + basename(fileName)),
                    )
                    .then(() => memo)
            },
        )
    }
    let fileName = join(originalDir, `${name}.webp`)
    return sharp(pathOrBuffer, options)
        .resize(sizes)
        .webp(webpOptions)
        .toFile(fileName)
        .then(() => ({
            default: dateDir + '/' + `${name}.webp`,
        }))
}
