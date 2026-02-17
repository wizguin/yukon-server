import BaseHandler from './BaseHandler'

import type User from '@objects/user/User'

export default class LoginHandler extends BaseHandler {

    constructor(
        public id: string,
        public users: Record<string, User>
    ) {
        super(id, users)

        this.logging = false

        this.startPlugins('/login')
    }

}
