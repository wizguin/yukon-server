import Plugin from '../Plugin'


export default class Igloo extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'update_furniture': this.updateFurniture
        }
    }

    // Events

    async updateFurniture(args, user) {
        await this.db.userFurnitures.destroy({ where: { userId: user.data.id  } })

        if (!args.furniture) return

        let igloo = this.getIgloo(user.data.id)
        if (!igloo) return

        let quantities = {}
        let furniture = []

        for (let item of args.furniture) {
            let id = item.furnitureId
            if (!item || !user.furnitureInventory.includes(id)) continue

            // Update quantity
            quantities[id] = (quantities[id]) ? quantities[id] + 1 : 1

            // Validate quantity
            if (quantities[id] > user.furnitureInventory.list[id]) continue

            furniture.push(item)
            this.db.userFurnitures.create({ ...item, userId: user.data.id })
        }

        // Update on igloo object
        igloo.furniture = furniture
    }

    // Functions

    getIgloo(id) {
        let internalId = id + 2000

        if (internalId in this.rooms) {
            return this.rooms[internalId]
        }
    }

}
