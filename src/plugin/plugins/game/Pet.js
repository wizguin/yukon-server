import GamePlugin from '@plugin/GamePlugin'


export default class Pet extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'adopt_pet': this.adoptPet
        }
    }

    adoptPet(args, user) {
        user.pets.add(args.petId, args.name)
    }

}
