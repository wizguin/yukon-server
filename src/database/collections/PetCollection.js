import Collection from '../Collection'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

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
            this.user.addSystemMail(111, name)

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

            updates.push({
                id: pet.id,
                energy: pet.energy,
                health: pet.health,
                rest: pet.rest
            })
        }

        if (updates.length) {
            // Bulk update
            this.model.bulkCreate(updates, { updateOnDuplicate: ['energy', 'health', 'rest'] })
        }
    }

    getNewStat(stat) {
        return Math.max(0, stat - this.statLoss)
    }

    stopPetUpdate() {
        clearInterval(this.petUpdate)
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
