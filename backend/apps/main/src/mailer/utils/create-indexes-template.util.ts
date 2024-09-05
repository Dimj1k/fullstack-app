import { Dirent, PathLike } from 'fs'
import { opendir } from 'fs/promises'
import * as readline from 'readline/promises'
import { extname, join } from 'path'
import { createReadStream, writeJson } from 'fs-extra'
import { isExists } from '../../shared/utils'

export const jsonIndexesName = 'indexes.json'

export function setAsyncDispose<T>(obj: T, cbClose: string = 'close') {
    return Object.assign(obj, {
        [Symbol.asyncDispose]: async () => obj[cbClose](),
    })
}

export const createIndexesForTemplates = async (pathToTemplates: PathLike) => {
    if (!(await isExists(pathToTemplates, 'Directory'))) {
        console.warn(`${pathToTemplates} - не директория`)
        return
    }
    await using rootDir = setAsyncDispose(
        await opendir(pathToTemplates, { recursive: true }),
    )
    let file: Dirent | null
    while ((file = await rootDir.read())) {
        if (file.isFile() && extname(file.name).toLowerCase() == '.html') {
            let templatePath = join(file.parentPath, file.name)
            let data = await createIndexes(templatePath)
            writeJson(
                join(file.parentPath, jsonIndexesName),
                data,
                (err) => err && console.error(err),
            )
        }
    }
}

async function createIndexes(templatePath: string) {
    let indexes: Indexes = {}
    await using rl = setAsyncDispose(
        readline.createInterface({
            input: createReadStream(templatePath, { encoding: 'utf-8' }),
            crlfDelay: Infinity,
        }),
    )
    const reVariable = /{\s?\w+\s?}/g
    const reBrackets = /{\s?|\s?}/g
    let lineno = 0
    for await (let line of rl) {
        let matched = line.matchAll(reVariable)
        ++lineno
        for (let m of matched) {
            let varName = m[0].replaceAll(reBrackets, '')
            if (!(lineno in indexes))
                indexes[lineno] = [
                    {
                        varName,
                        startCol: m.index,
                        endCol: m.index + m[0].length,
                    },
                ]
            else
                indexes[lineno].push({
                    varName,
                    startCol: m.index,
                    endCol: m.index + m[0].length,
                })
        }
    }
    return indexes
}

export type varNameOnThisLine = {
    varName: string
    startCol: number
    endCol: number
}

export type Indexes = Record<`${number}`, varNameOnThisLine[]>
