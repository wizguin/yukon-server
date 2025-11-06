import type GameUser from '../GameUser'
import Igloo from '@objects/room/Igloo'

import { isNumber } from '@utils/validation'

interface Includes {
    includes: (...args: any[]) => boolean
}

export default class PurchaseValidator {

    user: GameUser

    constructor(user: GameUser) {
        this.user = user
    }

    get crumbs() {
        return this.user.crumbs
    }

    item(id: number) {
        return this.validate(id, 'items', this.user.inventory)
    }

    igloo(id: number) {
        return this.validate(id, 'igloos', this.user.igloos)
    }

    furniture(id: number) {
        return this.validate(id, 'furnitures')
    }

    flooring(id: number) {
        if (!(this.user.room instanceof Igloo)) {
            return
        }

        return this.validate(id, 'floorings', [this.user.room.flooring])
    }

    // @ts-expect-error temp
    validate(id: number | string, type: string, includes: Includes = []) {
        if (typeof id === 'string') {
            id = parseInt(id)
        }

        if (!isNumber(id)) {
            return false
        }

        const item = this.crumbs[type][id]

        if (!item) {
            return false

        } else if (item.cost > this.user.coins) {
            this.user.send('error', { error: 'You need more coins.' })
            return false

        } else if (includes.includes(id)) {
            this.user.send('error', { error: 'You already have this item.' })
            return false

        } else if (item.patched) {
            this.user.send('error', { error: 'This item is not currently available.' })
            return false

        } else {
            return item
        }
    }

}
