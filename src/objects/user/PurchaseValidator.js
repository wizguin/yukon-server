export default class PurchaseValidator {

    constructor(user) {
        this.user = user
        this.crumbs = user.crumbs
    }

    item(id) {
        return this.validate(id, 'items', this.user.inventory)
    }

    igloo(id) {
        return this.validate(id, 'igloos', this.user.iglooInventory)
    }

    furniture(id) {
        return this.validate(id, 'furnitures')
    }

    flooring(id) {
        return this.validate(id, 'floorings', [this.user.room.flooring])
    }

    validate(id, type, includes = []) {
        let item = this.crumbs[type][id]

        if (!item) {
            return false

        } else if (item.cost > this.user.data.coins) {
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
