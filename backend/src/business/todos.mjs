import { v4 as uuid } from 'uuid';
import { TodosAccess } from '../dataLayer/todoAccess.mjs';
import { AttachmentUtil } from '../fileStorage/attachmentUtils.mjs';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('todos');

const attachmentUtil = new AttachmentUtil();
const todoAccess = new TodosAccess();

export async function getTodos(userId) {
    logger.info(`getTodos: ${userId}` , {
        key: userId
    })
    const result = todoAccess.getTodos(userId)
    logger.info(`getTodos: success`, {
        key: userId
    })
    return result
}

export async function createTodo(createTodoRequest, userId) {
    logger.info(`createTodo: ${createTodoRequest}`, {
        key: userId
    });
    const todoId = uuid();

    const newTodo = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
    };

    const result = await todoAccess.createTodo(newTodo);
    logger.info(`createTodo: successfully`, {
        key: userId,
        newTodo: newTodo
    });
    return result;
}

export async function updateTodo(updateTodoRequest, userId, todoId) {
    logger.info(`updateTodoRequest: ${JSON.stringify(updateTodoRequest)}`, {
        key: userId
    });
    const updateTodo = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        attachmentUrl: null
    };

    await todoAccess.updateTodo(updateTodo, userId, todoId);
    logger.info(`updateTodo: success`, {
        key: userId,
        updateTodo: updateTodo
    });
}

export async function deleteTodo(userId, todoId) {
    logger.info(`deleteTodo: ${todoId}`, {
        key: userId
    });
    await todoAccess.deleteTodo(userId, todoId);
    logger.info(`deleteTodo: success`, {
        key: userId
    });
}

export async function generateUploadUrl(todoId, userId) {
    const result = await attachmentUtil.generateUploadUrl(todoId, userId);

    logger.info(`generateUploadUrl: success`, {
        key: userId
    });
    return result;
}