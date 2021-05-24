export default class Inventory {

    constructor(user, inventory) {
        this.user = user
        this.db = user.db
        this.items = user.crumbs.items
        this.list = inventory
    }

    includes(item) {
        return this.list.includes(item)
    }

    /**
     * Adds an item to the users inventory.
     *
     * @param {number} item - Item ID
     */
    add(item) {
        this.list.push(item)

        // Db query
        this.db.inventories.create({ userId: this.user.data.id, itemId: item })
    }

}
