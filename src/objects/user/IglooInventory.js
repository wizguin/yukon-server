export default class IglooInventory {

    constructor(user, inventory) {
        this.user = user
        this.db = user.db
        this.igloos = user.crumbs.igloos
        this.list = inventory
    }

    includes(item) {
        return this.list.includes(item)
    }

    add(igloo) {
        this.list.push(igloo)

        // Db query
        this.db.iglooInventories.create({ userId: this.user.data.id, iglooId: igloo })
    }

}
