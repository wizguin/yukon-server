import GamePlugin from '@plugin/GamePlugin'

import { isNumber } from '@utils/validation'

import Igloo from '@objects/room/Igloo'


export default class Join extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'load_player': this.loadPlayer,
            'join_server': this.joinServer,
            'join_room': this.joinRoom,
            'join_igloo': this.joinIgloo
        }
    }

    // Events

    loadPlayer(args, user) {
        user.send('load_player', {
            user: user,
            rank: user.rank,
            coins: user.coins,
            buddies: user.buddies,
            ignores: user.ignores,
            inventory: user.inventory,
            igloos: user.igloos,
            furniture: user.furniture
        })
    }

    joinServer(args, user) {
        // Update token on database now that user has fully connected
        if (user.token.oldSelector) {
            this.db.authTokens.destroy({ where: { userId: user.id, selector: user.token.oldSelector } })
        }

        if (user.token.selector && user.token.validatorHash) {
            this.db.authTokens.create({ userId: user.id, selector: user.token.selector, validator: user.token.validatorHash })
        }

        let spawn = this.getSpawn()
        user.joinRoom(spawn)
    }

    joinRoom(args, user) {
        user.joinRoom(this.rooms[args.room], args.x, args.y)
    }

    async joinIgloo(args, user) {
        let igloo = await this.getIgloo(args.igloo)

        user.joinRoom(igloo, args.x, args.y)
    }

    // Functions

    getSpawn() {
        let preferredSpawn = this.config.game.preferredSpawn

        if (preferredSpawn && !this.rooms[preferredSpawn].isFull) {
            return this.rooms[preferredSpawn]
        }

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
        let iglooId = id + this.config.game.iglooIdOffset

        if (!(iglooId in this.rooms)) {
            let igloo = await this.db.getIgloo(id)

            if (!igloo) {
                return null
            }

            this.rooms[iglooId] = new Igloo(igloo, this.db, this.config.game.iglooIdOffset)
        }

        return this.rooms[iglooId]
    }

}
