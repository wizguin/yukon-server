import { Prisma } from '../generated/prisma/client'

export class InsufficientCoinsError extends Error { }

export class FlooringAlreadyOwnedError extends Error { }

export class FurnitureLimitError extends Error { }

export class PetLimitError extends Error { }

export class InboxFullError extends Error { }

export function isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}
