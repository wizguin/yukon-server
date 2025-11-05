import BaseHandler from './BaseHandler'

import type Database from '@database/Database'
import type User from '@objects/user/User'

export default class LoginHandler extends BaseHandler {

    constructor(
        public id: string,
        public users: Record<string, User>,
        public db: Database
    ) {
        super(id, users, db)

        this.logging = false

        this.startPlugins('/login')
    }

}
