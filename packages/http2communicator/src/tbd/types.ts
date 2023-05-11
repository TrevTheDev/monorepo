import { RequireKeys } from '@trevthedev/toolbelt'
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

export const questionIdSchema = v.string
export type QuestionId = v.Infer<typeof questionIdSchema>

export const responseIdSchema = v.string
export type ResponseId = v.Infer<typeof responseIdSchema>

export const messagePayloadSchema = v.record(v.string, v.unknown)
export type MessagePayload = v.Infer<typeof messagePayloadSchema>

// export type PossibleMessage = {
//   type?: MessageTypes
//   questionId: QuestionId
//   responseId?: ResponseId
//   message?: MessagePayload
// }

export const messageSchema = v.object({
  type: messageTypesSchema,
  message: messagePayloadSchema,
  questionId: questionIdSchema.optional(),
  responseId: responseIdSchema.optional(),
})

export type Message = v.Infer<typeof messageSchema>

export const questionSchema = messageSchema.extends({
  type: v.literal('question'),
  questionId: questionIdSchema,
})
export type Question = RequireKeys<Message, 'questionId'>
// const qs = v.custom<>
