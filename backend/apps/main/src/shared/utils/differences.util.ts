import { reduce } from 'async'
type ObjectKeys = string | symbol | number

export async function diff<T extends Record<ObjectKeys, any>>(
    objectFoundDiff: T,
    originalObject: { [key in keyof T]: T[key] },
): Promise<Partial<T>> {
    return reduce(
        Object.entries(objectFoundDiff),
        {},
        async (memo, [key, item]) => {
            let origItem = originalObject[key] as typeof item
            if (!origItem) memo[key] = item
            else if (Array.isArray(item)) {
                memo[key] = (await diff(
                    item.sort(),
                    origItem.sort(),
                )) as unknown[]
                if (Object.keys(memo[key]).length)
                    memo[key] = Object.values(memo[key])
                else delete memo[key]
            } else if (item && typeof item == 'object') {
                memo[key] = await diff(item, origItem)
                if (!Object.keys(memo[key]).length) delete memo[key]
            } else if (item !== origItem) memo[key] = item
            return memo
        },
    )
}
