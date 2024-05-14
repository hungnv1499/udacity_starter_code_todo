import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import * as todoLogic from '../../business/todos.mjs';
import { getUserId } from '../utils.mjs';

const { getTodos } = todoLogic;

export const handler = middy()
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
.handler(async (event) => {
  const userId = getUserId(event);
  const todos = await getTodos(userId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: todos
    })
  };
})