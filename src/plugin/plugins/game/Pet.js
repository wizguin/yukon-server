import GamePlugin from '@plugin/GamePlugin'


export default class Pet extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'adopt_pet': this.adoptPet,
            'get_pets': this.getPets,
            'pet_move': this.petMove
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

    petMove(args, user) {
        if (user.pets.includes(args.id)) {
            const pet = user.pets.get(args.id)

            pet.x = args.x
            pet.y = args.y

            user.room.send(user, 'pet_move', args)
        }
    }

}
