import Errors from '../errors/Errors'
import { getUserByUsername } from '../../../src/utils/user'

import { compare } from 'bcrypt'
import { type } from 'arktype'

const Login = type({
    username: 'string.trim |> 4 <= string <= 12',
    password: '3 <= string <= 128'
})

export async function authenticateUser(input: unknown) {
    const body = Login(input)

    if (body instanceof type.errors) {
        return { success: false }
    }

    const { username, password } = body

    const user = await getUserByUsername(username)

    if (!user) {
        return { success: false, error: Errors.UserNotFound }
    }

    const match = await compare(password, user.password)

    if (!match) {
        return { success: false, error: Errors.IncorrectPassword }
    }

    return { success: true }
}
