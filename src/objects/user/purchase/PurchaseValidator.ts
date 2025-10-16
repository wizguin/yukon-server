import { isNumber } from '@utils/validation'


export default class PurchaseValidator {

    constructor(user) {
        this.user = user
    }

    get crumbs() {
        return this.user.crumbs
    }

    item(id) {
        return this.validate(id, 'items', this.user.inventory)
    }

    igloo(id) {
        return this.validate(id, 'igloos', this.user.igloos)
    }

    furniture(id) {
        return this.validate(id, 'furnitures')
    }

    flooring(id) {
        return this.validate(id, 'floorings', [this.user.room.flooring])
    }

    validate(id, type, includes = []) {
        id = parseInt(id)

        if (!isNumber(id)) {
            return false
        }

        let item = this.crumbs[type][id]

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
