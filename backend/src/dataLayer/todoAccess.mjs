import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.mjs';

import AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

export class TodosAccess {
    constructor(
        docClient = new XAWS.DynamoDB.DocumentClient(), 
        todosTable = process.env.TODOS_TABLE) {
            this.docClient = docClient;
            this.todosTable = todosTable;
    }

    // Get list todos by userId
    async getTodos(userId) {
        logger.info(`Get list todo by userId: ${userId}`);
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        return result.Items;
    }

    // Create new todo item
    async createTodo(todo) {
        logger.info(`Create new todo:  ${todo.todoId}`);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    // Update existing todo item
    async updateTodo(todo, userId, todoId) {
        logger.info(`Update todo by todoId: ${todoId}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set #nameTodo = :name, dueDate = :dueDate, done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId':  todoId,
                ':name':    todo.name,
                ':dueDate': todo.dueDate,
                ':done':    todo.done
            },
            ExpressionAttributeNames: {
                '#nameTodo': 'name'
            }
        }).promise();
    }

    // Delete todo by userId
    async deleteTodo(userId, todoId) {
        logger.info(`Delete todo by id: ${todoId}`);
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise();
    }
}