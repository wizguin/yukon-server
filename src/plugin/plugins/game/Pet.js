import GamePlugin from '@plugin/GamePlugin'


export default class Pet extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'adopt_pet': this.adoptPet,
            'get_pets': this.getPets
        }
    }

    adoptPet(args, user) {
        user.pets.add(args.petId, args.name)
    }

    async getPets(args, user) {
        const owner = this.usersById[args.userId]
        const pets = owner ? owner.pets : await this.db.getPets(args.userId)

        user.send('get_pets', { pets: pets })
    }

}
