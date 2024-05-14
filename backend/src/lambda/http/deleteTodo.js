import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import * as todoLogic from '../../business/todos.mjs';

import { getUserId } from '../utils.mjs';

const { deleteTodo } = todoLogic;

export const handler = middy()
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
.handler(async (event) => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
    
  await deleteTodo(userId, todoId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  };
})