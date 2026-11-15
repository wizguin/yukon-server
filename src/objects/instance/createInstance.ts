import CardInstance from './card/CardInstance'
import SledInstance from './sled/SledInstance'

import type Waddle from '@objects/room/waddle/Waddle'

const types = {
    card: CardInstance,
    sled: SledInstance
}

type InstanceType = keyof typeof types

export default function createInstance(waddle: Waddle) {
    const game = waddle.game

    if (!Object.hasOwn(types, game)) {
        throw new Error(`Unsupported waddle game: ${game}`)
    }

    return new types[game as InstanceType](waddle)
}
