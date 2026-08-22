import { type } from 'arktype'

export const X = type('0 <= number <= 1520')
export const Y = type('0 <= number <= 960')

export function hasProps(object: any, ...props: string[]) {
    for (const prop of props) {

        if (!(prop in object)) {
            return false
        }
    }

    return true
}

export function isNumber(value: any) {
    return typeof value === 'number'
        && !isNaN(value)
        && Number.isInteger(value)
}

export function isString(value: any) {
    return typeof value === 'string'
}

export function isInRange(value: number, min: number, max: number) {
    if (!isNumber(value) || value < min || value > max) {
        return false
    }

    return true
}

export function isLength(value: string, min: number, max: number) {
    if (!isString(value) || value.length < min || value.length > max) {
        return false
    }

    return true
}
