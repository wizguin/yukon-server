import GamePlugin from '@plugin/GamePlugin'

import { isInRange } from '@utils/validation'


export default class Igloo extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'add_igloo': this.addIgloo,
            'add_furniture': this.addFurniture,

            'update_igloo': this.updateIgloo,
            'update_furniture': this.updateFurniture,
            'update_flooring': this.updateFlooring,
            'update_music': this.updateMusic,

            'open_igloo': this.openIgloo,
            'close_igloo': this.closeIgloo,

            'get_igloos': this.getIgloos,
            'get_igloo_open': this.getIglooOpen
        }
    }

    // Events

    async addIgloo(args, user) {
        let igloo = user.validatePurchase.igloo(args.igloo)

        if (!igloo) {
            return
        }

        user.igloos.add(args.igloo)

        user.updateCoins(-igloo.cost)
        user.send('add_igloo', { igloo: args.igloo, coins: user.coins })
    }

    addFurniture(args, user) {
        let furniture = user.validatePurchase.furniture(args.furniture)

        if (!furniture) {
            return
        }

        // If furniture added successfuly
        if (user.furniture.add(args.furniture)) {
            user.updateCoins(-furniture.cost)
            user.send('add_furniture', { furniture: args.furniture, coins: user.coins })
        }
    }

    async updateIgloo(args, user) {
        let igloo = this.getIgloo(user.id)

        if (!igloo || igloo != user.room || igloo.type == args.type) {
            return
        }

        if (!user.igloos.includes(args.type)) {
            return
        }

        await igloo.clearFurniture()

        igloo.update({ type: args.type })
        igloo.update({ flooring: 0 })

        igloo.type = args.type
        igloo.flooring = 0

        // Refresh igloo
        igloo.refresh(user)
    }

    async updateFurniture(args, user) {
        let igloo = this.getIgloo(user.id)

        if (!Array.isArray(args.furniture) || !igloo || igloo != user.room) {
            return
        }

        await igloo.clearFurniture()

        let quantities = {}

        for (let item of args.furniture) {
            let id = item.furnitureId

            if (!item || !user.furniture.includes(id)) {
                continue
            }

            // Update quantity
            quantities[id] = (quantities[id]) ? quantities[id] + 1 : 1

            // Validate quantity
            if (quantities[id] > user.furniture.getQuantity(id)) {
                continue
            }

            igloo.furniture.push({ ...item, userId: user.id })
        }

        this.db.furnitures.bulkCreate(igloo.furniture)
    }

    updateFlooring(args, user) {
        let igloo = this.getIgloo(user.id)

        if (!igloo || igloo != user.room) {
            return
        }

        let flooring = user.validatePurchase.flooring(args.flooring)

        if (!flooring) {
            return
        }

        igloo.update({ flooring: args.flooring })
        igloo.flooring = args.flooring

        user.updateCoins(-flooring.cost)
        user.send('update_flooring', { flooring: args.flooring, coins: user.coins })
    }

    updateMusic(args, user) {
        let igloo = this.getIgloo(user.id)

        if (!igloo || igloo != user.room || igloo.music == args.music) {
            return
        }

        if (!isInRange(args.music, 0, 999)) {
            return
        }

        igloo.update({ music: args.music })
        igloo.music = args.music

        user.send('update_music', { music: args.music })
    }

    openIgloo(args, user) {
        let igloo = this.getIgloo(user.id)

        if (igloo && igloo == user.room) {
            this.openIgloos.add(user)
        }
    }

    closeIgloo(args, user) {
        let igloo = this.getIgloo(user.id)

        if (igloo && igloo == user.room) {
            this.openIgloos.remove(user)
        }
    }

    getIgloos(args, user) {
        user.send('get_igloos', { igloos: this.openIgloos })
    }

    getIglooOpen(args, user) {
        let open = this.openIgloos.includes(args.igloo)

        user.send('get_igloo_open', { open: open })
    }

    // Functions

    getIgloo(id) {
        let iglooId = id + this.config.game.iglooIdOffset

        if (iglooId in this.rooms) {
            return this.rooms[iglooId]
        }
    }

}
