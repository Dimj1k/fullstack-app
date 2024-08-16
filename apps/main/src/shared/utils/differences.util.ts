import { ObjectKeys } from './chainable-class.util'

export function differences<T1 extends Record<ObjectKeys, any>>(
    objectFoundDiff: T1,
    originalObject: T1,
): Partial<T1> {
    let differencesByObjects: Record<ObjectKeys, any> = {}
    for (let key in objectFoundDiff) {
        let [d, orig] = [objectFoundDiff[key], originalObject[key]]
        if (typeof d !== 'object' && d !== orig) differencesByObjects[key] = d
        else if (typeof d === 'object') {
            differencesByObjects[key] = differences(d, orig)
            if (!Object.keys(differencesByObjects[key]).length)
                delete differencesByObjects[key]
        }
    }
    return differencesByObjects
}
