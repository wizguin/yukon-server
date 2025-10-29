export default function(object: any, ...keys: any[]) {
    return keys.reduce((obj, key) => {

        if (object && key in object) {
            obj[key] = object[key]
        }

        return obj

    }, {})
}
