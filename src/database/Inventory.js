export default class Inventory {

    constructor(user, inventory) {
        this.user = user
        this.db = user.db
        this.items = user.crumbs.items

        // Generates object from slots in format: { color: [], head: [], ... }
        let template = Object.fromEntries(this.items.slots.map(slot => [slot, []]))
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

}
