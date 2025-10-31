import BaseHandler from './BaseHandler'

import type { Config } from '../config/config'
import type Database from '@database/Database'
import type User from '@objects/user/User'

export default class LoginHandler extends BaseHandler {

    constructor(
        public id: string,
        public users: Record<string, User>,
        public db: Database,
        public config: Config
    ) {
        super(id, users, db, config)

        this.logging = false

        this.startPlugins('/login')
    }

}
