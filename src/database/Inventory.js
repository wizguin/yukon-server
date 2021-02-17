export default class Inventory {

    constructor(user, items, inventory) {
        this.user = user
        this.db = user.db
        // Item crumbs
        this.items = items

        // Generates object from slots in format: { color: [], head: [], ... }
        let template = Object.fromEntries(items.slots.map(slot => [slot, []]))
        Object.assign(this, template)

        // Assigns inventory list to slots
        this.init(inventory)
    }

    get list() {
        let { user, db, items, ...inventory } = this
        return inventory
    }

    get flat() {
        return Object.values(this.list).flat()
    }

    init(inventory) {
        for (let item of inventory) {
            let type = this.items[item].type
            let slot = this.items.slots[type - 1]

            this[slot].push(item)
        }
    }

    includes(item) {
        return this.flat.includes(item)
    }

    /**
     * Adds an item to the users inventory.
     * Should not be called directly, use user.addItem instead.
     *
     * @param {number} item - Item ID
     * @param {string} slot - Item slot
     */
    add(item, slot) {
        this[slot].push(item)

        // Db query
        this.db.inventories.create({ userId: this.user.data.id, itemId: item })
    }

    validateItem(id) {
        let item = this.items[id]
        if (!item) return false

        if (item.cost > this.user.data.coins) {
            this.user.send('error', { error: 'You need more coins.' })
            return false

        } else if (this.includes(id)) {
            this.user.send('error', { error: 'You already have this item.' })
            return false

        } else if (item.patched) {
            this.user.send('error', { error: 'This item is not currently available.' })
            return false

        } else {
            // Item validated
            return item
        }
    }

}
