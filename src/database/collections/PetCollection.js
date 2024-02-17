import Collection from '../Collection'

import { clamp } from '@utils/math'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

        this.feedPostcard = 110
        this.adoptPostcard = 111

        // 30 minutes
        const updatePetsInterval = 30 * 60000

        this.statLoss = 4
        this.petUpdate = setInterval(() => this.updatePets(), updatePetsInterval)
    }

    async add(petId, name) {
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

        for (const pet of Object.values(this.collection)) {
            pet.energy = this.getNewStat(pet.energy)
            pet.health = this.getNewStat(pet.health)
            pet.rest = this.getNewStat(pet.rest)

            // Pet ran away
            if (pet.dead) {
                this.user.addSystemMail(pets[pet.petId].ranPostcard, pet.name)
                this.remove(pet.id)

                continue
            }

            // Pet hungry
            if (pet.energy < 10 && !pet.feedPostcardSent) {
                this.user.addSystemMail(this.feedPostcard, pet.name)
                pet.feedPostcardSent = true
            }

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

    getNewStat(stat) {
        return clamp(stat - this.statLoss, 0, 100)
    }

    stopPetUpdate() {
        clearInterval(this.petUpdate)
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
