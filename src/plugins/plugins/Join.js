import Plugin from '../Plugin'
import Igloo from '../../objects/room/Igloo'

import { isNumber } from '../../utils/validation'


export default class Join extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)

        this.events = {
            'load_player': this.loadPlayer,
            'join_server': this.joinServer,
            'join_room': this.joinRoom,
            'join_igloo': this.joinIgloo
        }
    }

    // Events

    loadPlayer(args, user) {
        user.room = this.getRandomSpawn()

        user.send('load_player', {
            user: user.string,
            room: user.room.id,

            buddies: user.buddy.list,
            ignores: user.ignore.list,
            inventory: user.inventory.list,
            igloos: user.iglooInventory.list,
            furniture: user.furnitureInventory.list
        })
    }

    joinServer(args, user) {
        // Update token on database now that user has fully connected
        if (user.token.oldSelector) {
            this.db.authTokens.destroy({ where: { userId: user.data.id, selector: user.token.oldSelector } })
        }

        if (user.token.selector && user.token.validatorHash) {
            this.db.authTokens.create({ userId: user.data.id, selector: user.token.selector, validator: user.token.validatorHash })
        }

        user.room.add(user)
    }

    joinRoom(args, user) {
        user.joinRoom(this.rooms[args.room], args.x, args.y)
    }

    async joinIgloo(args, user) {
        let igloo = await this.getIgloo(args.igloo)

        user.joinRoom(igloo, args.x, args.y)
    }

    // Functions

    getRandomSpawn() {
        let spawns = Object.values(this.rooms).filter(room => room.spawn && !room.isFull)

        // All spawns full
        if (!spawns.length) {
            spawns = Object.values(this.rooms).filter(room => !room.game && !room.isFull)
        }

        return spawns[Math.floor(Math.random() * spawns.length)]
    }

    async getIgloo(id) {
        if (!isNumber(id)) {
            return null
        }

        // Ensures igloos are above all default rooms
        let internalId = id + this.config.game.iglooIdOffset

        if (!(internalId in this.rooms)) {
            let igloo = await this.db.getIgloo(id)

            if (!igloo) {
                return null
            }

            this.rooms[internalId] = new Igloo(igloo, this.db, this.config.game.iglooIdOffset)
        }

        return this.rooms[internalId]
    }

}
