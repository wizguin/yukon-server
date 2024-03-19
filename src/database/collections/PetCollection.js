import Collection from '../Collection'
import Pets from '@database/models/Pets'

import { clamp } from '@utils/math'
import { isLength, isString } from '@utils/validation'

import { pets } from '@data/data'


const feedPostcard = 110
const adoptPostcard = 111
const maxPets = 18
const nameRegex = /[^a-z ]/i

// 3.6 minutes
const updatePetsInterval = 3.6 * 60000
const statLoss = 1

export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

        // First update happens immediately
        this.petUpdate = setTimeout(() => this.updatePets(), 1)
    }

    async add(typeId, name) {
        if (this.count >= maxPets) {
            return
        }

        try {
            if (!(typeId in pets)) return

            if (!isString(name) || !isLength(name, 1, 12) || nameRegex.test(name)) {
                this.user.send('error', { error: 'Sorry, this name is not available. Please try again' })
                return
            }

            const pet = pets[typeId]

            if (this.user.coins < pet.cost) {
                this.user.send('error', { error: 'You need more coins.' })
                return
            }

            const model = await this.model.create({ userId: this.user.id, typeId: typeId, name: name })

            this.addModel(model)

            this.user.updateCoins(-pet.cost)
            this.user.send('adopt_pet', { id: model.id, coins: this.user.coins })
            this.user.addSystemMail(adoptPostcard, name)

        } catch (error) {
            this.handler.error(error)
        }
    }

    async updatePets() {
        const updates = []

        for (const pet of this.values) {
            this.decreaseStats(pet)

            if (this.checkRunAway(pet)) continue
            await this.checkHungry(pet)

            updates.push({
                id: pet.id,
                energy: pet.energy,
                health: pet.health,
                rest: pet.rest
            })
        }

        if (updates.length) {
            this.sendUpdates(updates)
        }

        // Schedule next update
        this.petUpdate = setTimeout(() => this.updatePets(), updatePetsInterval)
    }

    decreaseStats(pet) {
        // Prevent walking pets from running away
        const minStat = pet.walking ? 10 : 0

        pet.energy = this.getNewStat(pet.energy, minStat)
        pet.health = this.getNewStat(pet.health, minStat)
        pet.rest = this.getNewStat(pet.rest, minStat)
    }

    checkRunAway(pet) {
        // Can't run away whilst owner is in their igloo
        if (this.user.inOwnIgloo()) return false

        if (pet.dead) {
            this.user.addSystemMail(pets[pet.typeId].ranPostcard, pet.name)
            this.remove(pet.id)
        }

        return pet.dead
    }

    /**
     * Sends a postcard if the pet is hungry and one is not already associated.
     * Deleted postcards won't be resent until relogin.
     *
     * @param {Pets} pet - The pet instance to check
     */
    async checkHungry(pet) {
        if (!this.user.inOwnIgloo() && pet.hungry && !pet.feedPostcardId) {
            const postcard = await this.user.addSystemMail(feedPostcard, pet.name)

            pet.update({ feedPostcardId: postcard.id })
        }
    }

    sendUpdates(updates) {
        if (this.user.inOwnIgloo()) {
            this.user.room.send(this.user, 'update_pets', { updates: updates }, [])
        }

        // Bulk update
        this.model.bulkCreate(updates, { updateOnDuplicate: ['energy', 'health', 'rest'] })
    }

    getNewStat(stat, min = 0) {
        return clamp(stat - statLoss, min, 100)
    }

    stopPetUpdate() {
        clearTimeout(this.petUpdate)
    }

}
