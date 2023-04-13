import GamePlugin from '@plugin/GamePlugin'

import SenseiInstance from '@objects/instance/card/SenseiInstance'


export default class Sensei extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'join_sensei': this.joinSensei
        }

        this.senseiRoom = 951
    }

    joinSensei(args, user) {
        if (user.room.id != this.senseiRoom) {
            return
        }

        let instance = new SenseiInstance(user)

        instance.init()
    }

}
