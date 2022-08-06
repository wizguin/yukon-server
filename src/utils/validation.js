export function hasProps(object, ...props) {
    for (let prop of props) {

        if (!(prop in object)) {
            return false
        }
    }

    return true
}

export function isNumber(value) {
    return typeof value == 'number'
        && !isNaN(value)
        && Number.isInteger(value)
}

export function isString(value) {
    return typeof value == 'string'
}

export function isInRange(value, min, max) {
    if (!isNumber(value) || value < min || value > max) {
        return false
    }

    return true
}

export function isLength(value, min, max) {
    if (!isString(value) || value.length < min || value.length > max) {
        return false
    }

    return true
}
