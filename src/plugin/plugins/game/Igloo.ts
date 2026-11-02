import GamePlugin from '@plugin/GamePlugin'

import { config } from '@config'
import Database from '@database/Database'
import { flooring } from '@data'
import type GameUser from '@objects/user/GameUser'
import type IglooRoom from '@objects/room/Igloo'
import { InsufficientCoinsError } from '@utils/error'

import { type } from 'arktype'

const AddIgloo = type({
    igloo: 'number.integer'
})

const AddFurniture = type({
    furniture: 'number.integer'
})

const UpdateIgloo = type({
    type: 'number'
})

const Furniture = type({
    furnitureId: 'number',
    x: 'number',
    y: 'number',
    rotation: 'number',
    frame: 'number'
})

const UpdateFurniture = type({
    furniture: Furniture.array()
})

const UpdateFlooring = type({
    flooring: 'number.integer'
})

const UpdateMusic = type({
    music: '0 <= number <= 999'
})

const GetIglooOpen = type({
    igloo: 'number'
})

export default class Igloo extends GamePlugin {

    events = {
        add_igloo: this.addIgloo,
        add_furniture: this.addFurniture,

        update_igloo: this.updateIgloo,
        update_furniture: this.updateFurniture,
        update_flooring: this.updateFlooring,
        update_music: this.updateMusic,

        open_igloo: this.openIgloo,
        close_igloo: this.closeIgloo,

        get_igloos: this.getIgloos,
        get_igloo_open: this.getIglooOpen
    }

    async addIgloo(args: unknown, user: GameUser) {
        const { igloo: iglooId } = AddIgloo.assert(args)

        await user.addIgloo(iglooId)
    }

    async addFurniture(args: unknown, user: GameUser) {
        const { furniture: furnitureId } = AddFurniture.assert(args)

        await user.addFurniture(furnitureId)
    }

    async updateIgloo(args: unknown, user: GameUser) {
        const { type } = UpdateIgloo.assert(args)

        const igloo = this.getIgloo(user.id)

        if (!igloo || igloo !== user.room || igloo.type === type) {
            return
        }

        if (!user.igloos.includes(type)) {
            return
        }

        await igloo.clearFurniture()

        igloo.update({ type })
        igloo.update({ flooring: 0 })

        igloo.type = type
        igloo.flooring = 0

        igloo.refresh(user)
    }

    async updateFurniture(args: unknown, user: GameUser) {
        const { furniture } = UpdateFurniture.assert(args)

        const igloo = this.getIgloo(user.id)

        if (!igloo || igloo !== user.room) {
            return
        }

        await igloo.clearFurniture()

        const quantities: Record<number, number> = {}

        for (const item of furniture) {
            const id = item.furnitureId

            if (!user.furniture.includes(id)) {
                continue
            }

            // Update quantity
            quantities[id] = quantities[id] ? quantities[id] + 1 : 1

            // Validate quantity
            if (quantities[id] > user.furniture.getQuantity(id)) {
                continue
            }

            igloo.furniture.push({ ...item, userId: user.id })
        }

        await Database.furniture.createMany({
            data: igloo.furniture
        })
    }

    async updateFlooring(args: unknown, user: GameUser) {
        const { flooring: flooringId } = UpdateFlooring.assert(args)

        const igloo = this.getIgloo(user.id)

        if (!igloo || igloo !== user.room) {
            return
        }

        const item = flooring[flooringId]

        if (!item) {
            return
        }

        if (igloo.flooring === flooringId) {
            user.send('error', { error: 'You already have this item.' })
            return
        }

        if (item.patched) {
            user.send('error', { error: 'This item is not currently available.' })
            return
        }

        try {
            await user.purchase(item.cost, tx =>
                tx.igloo.update({
                    where: { userId: user.id },
                    data: { flooring: flooringId }
                })
            )

        } catch (error) {
            if (error instanceof InsufficientCoinsError) {
                user.send('error', { error: 'You need more coins.' })
                return
            }

            throw error
        }

        igloo.flooring = flooringId
        user.send('update_flooring', { flooring: flooringId, coins: user.coins })
    }

    updateMusic(args: unknown, user: GameUser) {
        const { music } = UpdateMusic.assert(args)

        const igloo = this.getIgloo(user.id)

        if (!igloo || igloo !== user.room || igloo.music === music) {
            return
        }

        igloo.update({ music })
        igloo.music = music

        user.send('update_music', { music })
    }

    openIgloo(args: unknown, user: GameUser) {
        const igloo = this.getIgloo(user.id)

        if (igloo && igloo === user.room) {
            this.openIgloos.add(user)
        }
    }

    closeIgloo(args: unknown, user: GameUser) {
        const igloo = this.getIgloo(user.id)

        if (igloo && igloo === user.room) {
            this.openIgloos.remove(user)
        }
    }

    getIgloos(args: unknown, user: GameUser) {
        user.send('get_igloos', { igloos: this.openIgloos })
    }

    getIglooOpen(args: unknown, user: GameUser) {
        const { igloo } = GetIglooOpen.assert(args)

        const open = this.openIgloos.includes(igloo)

        user.send('get_igloo_open', { open })
    }

    getIgloo(id: number) {
        const iglooId = id + config.game.iglooIdOffset

        if (iglooId in this.rooms) {
            return this.rooms[iglooId] as IglooRoom
        }
    }

}
