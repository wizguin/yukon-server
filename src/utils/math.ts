export function between(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
