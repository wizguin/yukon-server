import Collection from '../Collection'

import { clamp } from '@utils/math'

import { pets } from '@data/data'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

        this.feedPostcard = 110
        this.adoptPostcard = 111
        this.maxPets = 18

        // 3.6 minutes
        const updatePetsInterval = 3.6 * 60000

        this.statLoss = 1
        this.petUpdate = setInterval(() => this.updatePets(), updatePetsInterval)

        // First pet update happens immediately
        this.updatePets()
    }

    async add(petId, name) {
        if (this.count >= this.maxPets) {
            return
        }

        try {
            const model = await this.model.create({ userId: this.user.id, petId: petId, name: name })

            this.addModel(model)
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

            if (this.user.inOwnIgloo()) {
                this.user.room.send(this.user, 'update_pet', update, [])
            }
        }

        if (updates.length) {
            // Bulk update
            this.model.bulkCreate(updates, { updateOnDuplicate: ['energy', 'health', 'rest'] })
        }
    }

    checkPetRunAway(pet) {
        // Can't run away whilst owner is in their igloo
        // todo check walking
        if (this.user.inOwnIgloo()) return false

        if (pet.dead) {
            this.user.addSystemMail(pets[pet.petId].ranPostcard, pet.name)
            this.remove(pet.id)
        }

        return pet.dead
    }

    checkPetHungry(pet) {
        if (!this.user.inOwnIgloo() && pet.energy < 10 && !pet.feedPostcardSent) {
            this.user.addSystemMail(this.feedPostcard, pet.name)

            pet.feedPostcardSent = true
        }
    }

    getNewStat(stat, min = 0) {
        return clamp(stat - this.statLoss, min, 100)
    }

    stopPetUpdate() {
        clearInterval(this.petUpdate)
    }

}
