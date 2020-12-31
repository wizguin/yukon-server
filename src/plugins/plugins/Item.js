import Plugin from '../Plugin'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'update_player': this.updatePlayer
        }

        // Used to translate type id to string
        this.slots = [ 'color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award' ]
    }

    updatePlayer(args, user) {
        if (!user.inventory.includes(args.item)) return

        let item = this.items[args.item]
        if (!item || item.bait || item.award || args.type != item.type) return

        let slot = this.slots[item.type - 1]

        user.setItem(slot, args.item)
    }

}
