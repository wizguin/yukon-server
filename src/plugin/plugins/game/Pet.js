import GamePlugin from '@plugin/GamePlugin'


export default class Pet extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'adopt_pet': this.adoptPet,
            'get_pets': this.getPets,
            'pet_move': this.petMove,
            'pet_play': this.petPlay
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

    petPlay(args, user) {
        if (!user.pets.includes(args.id)) {
            return
        }

        const pet = user.pets.get(args.id)

        // Angry
        if (pet.rest < 20 || pet.happiness < 10) {
            return
        }

        // Different rest levels play different animation
        const playType = pet.rest > 80 ? 1 : pet.rest > 60 ? 2 : 0

        user.room.send(user, 'pet_play', { id: args.id, energy: pet.energy, health: pet.health, rest: pet.rest, playType: playType }, [])
    }

}
