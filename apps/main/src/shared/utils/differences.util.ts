import { reduce } from 'async'
import { ObjectKeys } from './chainable-class.util'

export async function differencesNoArray<T extends Record<ObjectKeys, any>>(
    objectFoundDiff: T,
    originalObject: { [key in keyof T]: T[key] },
): Promise<Partial<T>> {
    return reduce(Object.keys(objectFoundDiff), {}, async (memo, key) => {
        let item = objectFoundDiff[key]
        let origItem = originalObject[key]
        if (!origItem) memo[key] = item
        else if (item && typeof item == 'object') {
            memo[key] = await differencesNoArray(item, origItem)
            if (!Object.keys(memo[key]).length) delete memo[key]
        } else if (item !== origItem) memo[key] = item
        return memo
    })
}
