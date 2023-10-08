import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    private readonly docClient: DocumentClient
    private readonly todosTable: string
    private readonly todosCreateAtIndex: string

    constructor() {
         // @ts-ignore
        this.docClient = new XAWS.DynamoDB.DocumentClient()
        this.todosTable = process.env.TODOS_TABLE
        this.todosCreateAtIndex = process.env.TODOS_CREATED_AT_INDEX
    }

    async createTodo(item: TodoItem) {
        logger.info('createTodo start')
        logger.info(`creating todo for user: ${item.userId}`)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()
        logger.info('createTodo end')
    }

    async getTodosFor(userId: string): Promise<TodoItem[]> {
        logger.info(`getTodosFor for ${userId} start`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosCreateAtIndex,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ExpressionAttributeNames: {
                '#userId': 'userId'
            }
        }).promise()

        logger.info(`getTodosFor for ${userId} end`)
        return result.Items as TodoItem[]
    }

    async updateTodo(todoId: string, itemUpdate: TodoUpdate) {
        logger.info('updateTodo start')
        logger.info(`updating todo: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            },
            ExpressionAttributeValues: {
                ':name': itemUpdate.name,
                ':dueDate': itemUpdate.dueDate,
                ':done': itemUpdate.done
            }
          }).promise()
        logger.info('updateTodo end')
    }

    async deleteTodo(todoId: string) {
        logger.info('deleteTodo start')
        logger.info(`deleteTodo todo: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { todoId }
        }).promise()
        logger.info('deleteTodo end')
    }

    async getTodo(todoId: string): Promise<TodoItem> {
        logger.info('getTodo start')
        logger.info(`getTodo todo: ${todoId}`)
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: { todoId }
        }).promise()
        logger.info('getTodo end')
        return result.Item as TodoItem
    }
    
    async updateTodoWithAttachmentUrl(todoId: string, attachmentUrl: string) {
        logger.info('updateTodoWithAttachmentUrl start')
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }
        }) .promise()
    }
}