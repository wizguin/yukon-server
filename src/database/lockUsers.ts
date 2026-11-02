import type { TransactionClient } from '../generated/prisma/internal/prismaNamespace'

/** Lock user rows in ID order to avoid deadlocks from opposite lock ordering. */
export default async function lockUsers(tx: TransactionClient, userIds: number[]) {
    const ids = [...new Set(userIds)].sort((a, b) => a - b)

    for (const id of ids) {
        const users = await tx.$queryRaw<{ id: number }[]>`
            SELECT id FROM users WHERE id = ${id} FOR UPDATE
        `

        if (!users[0]) {
            throw new Error(`User ${id} does not exist`)
        }
    }
}
