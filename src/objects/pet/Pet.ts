import { clamp } from '@utils/math'
import pick from '@utils/pick'

import type GameUser from '@objects/user/GameUser'
import { pets } from '@data'
import Database from '@database/Database'
import type { Pet as PrismaPet } from '../../generated/prisma/client'

export interface Update {
    energy?: number
    health?: number
    rest?: number
}

const feedPostcard = 110

export default class Pet implements PrismaPet {

    x = 0
    y = 0

    walking = false

    constructor(
        public user: GameUser,
        public id: number,
        public userId: number,
        public typeId: number,
        public name: string,
        public adoptionDate: Date,
        public energy: number,
        public health: number,
        public rest: number,
        public feedPostcardId: number | null
    ) { }

    get hungry() {
        return this.energy < 10
    }

    get dead() {
        return this.energy === 0 || this.health === 0 || this.rest === 0
    }

    get happiness() {
        const statTotal = this.energy + this.health + this.rest

        return Math.round(statTotal / 300 * 100)
    }

    get stats() {
        const { energy, health, rest } = this

        return { energy, health, rest }
    }

    async update() {
        this.decreaseStats()

        if (await this.checkRunAway()) {
            return false
        }

        await this.checkHungry()

        return { id: this.id, ...this.stats }
    }

    decreaseStats() {
        if (this.energy === 0 && this.health === 0 && this.rest === 0) {
            return
        }

        this.updateStats({
            energy: -1,
            health: -1,
            rest: -1
        })
    }

    async checkRunAway() {
        if (this.user.inOwnIgloo()) {
            return false
        }

        if (this.dead) {
            await this.user.addSystemMail(pets[this.typeId].ranPostcard, this.name)

            await this.user.pets.remove(this.id)
        }

        return this.dead
    }

    /**
     * Sends a postcard if the pet is hungry and one is not already associated.
     * Deleted postcards won't be resent until relogin.
     */
    async checkHungry() {
        if (!this.user.inOwnIgloo() && this.hungry && this.feedPostcardId === null) {
            this.sendFeedPostcard()
        }
    }

    async sendFeedPostcard() {
        try {
            const postcard = await this.user.addSystemMail(feedPostcard, this.name)

            if (!postcard) {
                return
            }

            await Database.pet.update({
                where: {
                    id: this.id
                },
                data: {
                    feedPostcardId: postcard.id
                }
            })

            this.feedPostcardId = postcard.id

        } catch (error) {
            console.error(error)
        }
    }

    async updateStats(update: Update) {
        this.energy = this.getNewStat(this.energy, update.energy)
        this.health = this.getNewStat(this.health, update.health)
        this.rest = this.getNewStat(this.rest, update.rest)

        try {
            await Database.pet.update({
                where: {
                    id: this.id
                },
                data: {
                    energy: this.energy,
                    health: this.health,
                    rest: this.rest
                }
            })

        } catch (error) {
            console.error(error)
        }
    }

    getNewStat(currentValue: number, update?: number) {
        if (!update) {
            return currentValue
        }

        const minValue = this.walking ? 10 : 0

        return clamp(currentValue + update, minValue, 100)
    }

    toJSON() {
        return pick(this,
            'id',
            'typeId',
            'name',
            'energy',
            'health',
            'rest',
            'x',
            'y',
            'walking'
        )
    }

}
