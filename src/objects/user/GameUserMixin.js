import UserMixin from './UserMixin'

import pick from '@utils/pick'
import { isInRange } from '@utils/validation'

import BuddyCollection from '@database/collections/BuddyCollection'
import FurnitureCollection from '@database/collections/FurnitureCollection'
import IglooCollection from '@database/collections/IglooCollection'
import IgnoreCollection from '@database/collections/IgnoreCollection'
import InventoryCollection from '@database/collections/InventoryCollection'

import PurchaseValidator from './purchase/PurchaseValidator'

import { Op } from 'sequelize'


const GameUserMixin = {

    init(server, socket) {
        super.init(server, socket)

        this.crumbs = this.handler.crumbs

        this.authenticated = false
        this.joinedServer = false
        this.token = {}

        this.room
        this.minigameRoom

        this.x
        this.y
        this.frame

        this.buddyRequests = []

        this.validatePurchase = new PurchaseValidator(this)
    },

    setItem(slot, item) {
        if (this[slot] == item) {
            return
        }

        this.update({ [slot]: item })

        this.room.send(this, 'update_player', { id: this.id, item: item, slot: slot }, [])
    },

    joinRoom(room, x = 0, y = 0) {
        if (!room || room === this.room || this.minigameRoom) {
            return
        }

        if (room.isFull && !this.isModerator) {
            return this.send('error', { error: 'Sorry this room is currently full' })
        }

        if (!isInRange(x, 0, 1520)) {
            x = 0
        }

        if (!isInRange(y, 0, 960)) {
            y = 0
        }

        if (this.room) {
            this.room.remove(this)
        }

        this.room = room
        this.x = x
        this.y = y
        this.frame = 1

        this.room.add(this)
    },

    joinTable(table) {
        if (table && !this.minigameRoom) {
            this.minigameRoom = table

            this.minigameRoom.add(this)
        }
    },

    addBuddy(id, username, requester = false) {
        this.buddies.add(id)

        let online = id in this.handler.usersById

        this.send('buddy_accept', { id: id, username: username, requester: requester, online: online })
    },

    removeBuddy(id) {
        this.buddies.remove(id)

        this.send('buddy_remove', { id: id })
    },

    clearBuddyRequest(id) {
        this.buddyRequests = this.buddyRequests.filter(request => request != id)
    },

    updateCoins(coins, gameOver = false) {
        coins = parseInt(coins)

        if (!isNaN(coins)) {
            coins = Math.max(Math.min(1000000000, this.coins + coins), 0)

            this.update({ coins: coins })
        }

        if (gameOver) {
            this.send('game_over', { coins: coins })
        }
    },

    async load(username) {
        return await this.reload({
            where: {
                username: username
            },

            include: [
                {
                    model: this.db.bans,
                    as: 'ban',
                    where: {
                        expires: {
                            [Op.gt]: Date.now()
                        }
                    },
                    required: false
                },
                {
                    model: this.db.buddies,
                    as: 'buddies',
                    include: {
                        model: this.db.users,
                        as: 'user',
                        attributes: ['username']
                    },
                    separate: true
                },
                {
                    model: this.db.ignores,
                    as: 'ignores',
                    include: {
                        model: this.db.users,
                        as: 'user',
                        attributes: ['username']
                    },
                    separate: true
                },
                {
                    model: this.db.inventories,
                    as: 'inventory',
                    attributes: ['itemId'],
                    separate: true
                },
                {
                    model: this.db.iglooInventories,
                    as: 'igloos',
                    attributes: ['iglooId'],
                    separate: true
                },
                {
                    model: this.db.furnitureInventories,
                    as: 'furniture',
                    separate: true
                }
            ]

        }).then((result) => {
            result.buddies = new BuddyCollection(this, result.buddies)
            result.ignores = new IgnoreCollection(this, result.ignores)
            result.inventory = new InventoryCollection(this, result.inventory)
            result.igloos = new IglooCollection(this, result.igloos)
            result.furniture = new FurnitureCollection(this, result.furniture)

            this.setPermissions()

            return true

        }).catch((error) => {
            //this.handler.error(error)

            return false
        })
    },

    toJSON() {
        return pick(this,
            'id',
            'username',
            'joinTime',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag',
            'x',
            'y',
            'frame'
        )
    }

}

Object.setPrototypeOf(GameUserMixin, UserMixin)

export default { ...UserMixin, ...GameUserMixin }
