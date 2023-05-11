import { v } from 'dilav'

export const messageTypesSchema = v.enum([
  'question',
  'reply',
  'listening',
  'continueMessage',
  'endMessage',
  'error',
  'questionReceived',
  'replyReceived',
])

export type MessageTypes = v.Infer<typeof messageTypesSchema>

export const messageIdSchema = v.string
export type MessageId = v.Infer<typeof messageIdSchema>

export const responseIdSchema = v.string
export type ResponseId = v.Infer<typeof responseIdSchema>

export const messagePayloadSchema = v.record(v.string, v.unknown)
export type MessagePayload = v.Infer<typeof messagePayloadSchema>

export const messageSchema = v.object({
  id: messageIdSchema,
  type: messageTypesSchema,
  message: messagePayloadSchema,
})

export type Message = v.Infer<typeof messageSchema>
