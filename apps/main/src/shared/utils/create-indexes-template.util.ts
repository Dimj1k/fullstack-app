import { Dirent, PathLike } from 'fs'
import { opendir } from 'fs/promises'
import * as readline from 'readline/promises'
import { extname, join } from 'path'
import { createReadStream, writeJson } from 'fs-extra'
import { isExists } from './is-exists.util'

export const jsonIndexesName = 'indexes.json'

export const createIndexesForTemplates = async (pathToTemplates: PathLike) => {
    if (!(await isExists(pathToTemplates, 'Directory'))) {
        console.warn(`${pathToTemplates} - не директория`)
        return
    }
    let rootDir = await opendir(pathToTemplates, { recursive: true })
    try {
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
    } finally {
        await rootDir.close()
    }
}

async function createIndexes(templatePath: string) {
    let indexes: Indexes = {}
    const rl = readline.createInterface({
        input: createReadStream(templatePath, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
    })
    try {
        const reVariable = /{\s?\w+\s?}/g
        const reBrackets = /{\s?|\s?}/g
        let lineno = 0
        for await (let line of rl) {
            let matched = line.matchAll(reVariable)
            let linenoAsString = (++lineno).toString() //
            for (let m of matched) {
                let varName = m[0].replaceAll(reBrackets, '')
                if (!(linenoAsString in indexes))
                    indexes[linenoAsString] = [
                        {
                            varName,
                            startCol: m.index,
                            endCol: m.index + m[0].length,
                        },
                    ]
                else
                    indexes[linenoAsString].push({
                        varName,
                        startCol: m.index,
                        endCol: m.index + m[0].length,
                    })
            }
        }
        return indexes
    } finally {
        rl.close()
    }
}

export type varNameInThisLine = {
    varName: string
    startCol: number
    endCol: number
}

export type Indexes = Record<`${number}`, varNameInThisLine[]>
