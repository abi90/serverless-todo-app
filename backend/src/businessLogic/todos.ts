import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'

const todoAccess = new TodosAccess()
const logger = createLogger('Todos')
const attachmentUtils = new AttachmentUtils()

// TODO: Implement businessLogic
export const createTodo = async (request: CreateTodoRequest, userId: string ): Promise<TodoItem> => {
    try {
        logger.info('creating todo')
        const item: TodoItem = {
            userId,
            todoId: uuid.v4(),
            createdAt: new Date().toISOString(),
            attachmentUrl: null,
            done: false,
            ...request
        } as TodoItem

        await todoAccess.createTodo(item)
        return item
    } catch (e) {
        logger.log('error', e)
        throw e
    }
}

export const getAllTodosFor = async (userId: string): Promise<TodoItem[]> => {
    try {
        logger.info('get all todos for user')
        return await todoAccess.getTodosFor(userId)
    } catch (e) {
        logger.info(e)
        logger.log('error', e)
        throw e
    }
}

export const updateTodo = async (request: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate | createError.HttpError> => {
    try {
        logger.info('updating todo')

        if (await isOwner(userId, todoId)) {
            return new createError.Forbidden()
        }

        const item = { ...request } as TodoUpdate
        await todoAccess.updateTodo(todoId, item)
        
        return item
    } catch (e) {
        logger.log('error', e)
        throw e
    }
}

export const deleteTodo = async (userId: string, todoId: string): Promise<string | createError.HttpError> => {
    try {
        logger.info('updating todo')

        if (await isOwner(userId, todoId)) {
            return new createError.Forbidden()
        }
        
        await todoAccess.deleteTodo(todoId)
        return todoId
    } catch (e) {
        logger.log('error', e)
        throw e
    }
}

export const createAttachmentPresignedUrl = async (attachmentId: string): Promise<string | createError.HttpError> => {
    try {
        logger.info('creating attachment presigned url')
        return attachmentUtils.getSignedUrl(attachmentId)
    } catch (e) {
        logger.log('error', e)
        throw e
    }
}

export const updateTodoWithAttachmentUrl = async (userId: string, todoId: string, attachmentId: string): Promise<string | createError.HttpError> => {
    try {
        logger.info('updating todo with attachment url')

        if (await isOwner(userId, todoId)) {
            return new createError.Forbidden()
        }
        const attachmentUrl = attachmentUtils.getAttachmentUrl(attachmentId)
        await todoAccess.updateTodoWithAttachmentUrl(todoId, attachmentUrl)
    } catch (e) {
        logger.log('error', e)
        throw e
    }
}

const isOwner = async (userId, todoId): Promise<boolean> => {
    const item = await todoAccess.getTodo(todoId)
    return userId !== item.userId
}