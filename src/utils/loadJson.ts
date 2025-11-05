import { readFileSync } from 'fs'

export function loadJson(path: string) {
    return JSON.parse(readFileSync(`${path}.json`, 'utf-8'))
}
