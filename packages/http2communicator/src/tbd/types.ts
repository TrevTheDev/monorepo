import { v } from 'dilav'
import { ConversationId } from './conversation db'
import HttpError from './stream/http error'

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

export type QuestionId = MessageId

export const responseIdSchema = v.string
export type ResponseId = v.Infer<typeof responseIdSchema>

export const messagePayloadSchema = v.record(v.string, v.unknown)
export type MessagePayload = v.Infer<typeof messagePayloadSchema>

export const messageSchema = v.object(
  {
    type: messageTypesSchema,
    id: messageIdSchema,
    message: messagePayloadSchema,
  },
  v.never,
  { breakOnFirstError: true },
)

export type Message = v.Infer<typeof messageSchema>

export const http2IdSchema = v.string
export const http2IdxSchema = v.number.coerce
export const http2MethodSchema = v.enum(['GET'])

export interface HeaderSchema extends v.Infer<typeof headerSchema> {
  'http2-duplex-id': ConversationId
}

export const headerSchema = v
  .object(
    {
      'http2-duplex-id': http2IdSchema,
      'http2-duplex-idx': http2IdxSchema,
      ':method': http2MethodSchema,
    },
    v.unknown,
    { breakOnFirstError: true },
  )
  .customValidation((header) => {
    console.log(header)
    return undefined
  })

export type FirstHeaderSchema = v.Infer<typeof firstHeaderSchema>
export const firstHeaderSchema = v
  .object(
    {
      'http2-duplex-id': v.never,
      'http2-duplex-idx': v.literal(0),
      ':method': http2MethodSchema,
    },
    v.unknown,
    { breakOnFirstError: true },
  )
  .customValidation((header) => {
    console.log(header)
    return undefined
  })

export type SharedEvents = {
  onDone(): void
  onError(error: HttpError): void
  onCancel(reason: unknown): void
}

export type SharedIFace = {
  error(error: HttpError): void
  end(): void
  cancel(reason: unknown): void
}
