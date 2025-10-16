export function between(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}
