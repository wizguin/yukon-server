export default class Inventory {

    constructor(items, inventory) {
        // Item crumbs
        this.items = items

        // Generates object from slots in format: { color: [], head: [], ... }
        let template = Object.fromEntries(items.slots.map(slot => [slot, []]))
        Object.assign(this, template)

        // Assigns inventory list to slots
        this.init(inventory)
    }

    get list() {
        let { items, ...inventory } = this
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

}
