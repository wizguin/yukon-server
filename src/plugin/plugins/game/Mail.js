import GamePlugin from '@plugin/GamePlugin'


export default class Mail extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'read_mail': this.readMail
        }
    }

    readMail(args, user) {
        user.postcards.readMail()
    }

}
