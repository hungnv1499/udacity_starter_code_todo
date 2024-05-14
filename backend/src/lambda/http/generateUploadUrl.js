import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { createLogger } from '../../utils/logger.mjs';
import * as todoLogic from '../../business/todos.mjs';

import { getUserId } from '../utils.mjs';

const logger = createLogger('TodosAccess');

const { generateUploadUrl } = todoLogic;

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

    try {
      const url = await generateUploadUrl(todoId, userId);
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          uploadUrl: url
        })
      };
    } catch (e) {
      logger.error('generateUploadUrl get error:', { error: e });
    }
})