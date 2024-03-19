import Collection from '../Collection'

import { clamp } from '@utils/math'
import { isLength, isString } from '@utils/validation'

import { pets } from '@data/data'


const feedPostcard = 110
const adoptPostcard = 111
const maxPets = 18
const nameRegex = /[^a-z ]/i

// 3.6 minutes
const updatePetsInterval = 1
const statLoss = 1

export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

        // First update happens immediately
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
            this.user.addSystemMail(this.adoptPostcard, name)

        } catch (error) {
            this.handler.error(error)
        }
    }

    updatePets() {
        const updates = []

        for (const pet of this.values) {
            // Prevent walking pets from running away
            const minStat = pet.walking ? 10 : 0

            pet.energy = this.getNewStat(pet.energy, minStat)
            pet.health = this.getNewStat(pet.health, minStat)
            pet.rest = this.getNewStat(pet.rest, minStat)

            if (this.checkPetRunAway(pet)) continue

            this.checkPetHungry(pet)

            const update = {
                id: pet.id,
                energy: pet.energy,
                health: pet.health,
                rest: pet.rest
            }

            updates.push(update)
        }

        // No updates
        if (!updates.length) return

        if (this.user.inOwnIgloo()) {
            this.user.room.send(this.user, 'update_pets', { updates: updates }, [])
        }

        // Bulk update
        this.model.bulkCreate(updates, { updateOnDuplicate: ['energy', 'health', 'rest'] })
    }

    checkPetRunAway(pet) {
        // Can't run away whilst owner is in their igloo
        if (this.user.inOwnIgloo()) return false

        if (pet.dead) {
            this.user.addSystemMail(pets[pet.typeId].ranPostcard, pet.name)
            this.remove(pet.id)
        }

        return pet.dead
    }

    async checkPetHungry(pet) {
        if (!this.user.inOwnIgloo() && pet.energy < 10 && !pet.feedPostcardId) {
            const postcard = await this.user.addSystemMail(this.feedPostcard, pet.name)

            pet.update({ feedPostcardId: postcard.id })
        }
    }

    getNewStat(stat, min = 0) {
        return clamp(stat - statLoss, min, 100)
    }

    stopPetUpdate() {
        clearInterval(this.petUpdate)
    }

}
