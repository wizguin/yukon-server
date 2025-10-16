import BaseHandler from './BaseHandler'


export default class LoginHandler extends BaseHandler {

    constructor(id, users, db, config) {
        super(id, users, db, config)

        this.logging = false

        this.startPlugins('/login')
    }

}
