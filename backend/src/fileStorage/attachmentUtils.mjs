import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('todos');
import AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
});

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export function getSignedUploadUrl(todoId) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    });
}

export class AttachmentUtil {
    constructor(docClient = new XAWS.DynamoDB.DocumentClient(), todosTable = process.env.TODOS_TABLE) {
        this.docClient = docClient;
        this.todosTable = todosTable;
    }

    async generateUploadUrl(todoId, userId) {
        let url = getSignedUploadUrl(todoId);
        url = url.split("?")[0];
        logger.info(`createUploadUrl: ${url}, userId: ${userId}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set attachmentUrl=:urlUpload ',
            ExpressionAttributeValues: {
                ':urlUpload': url
            }
        }).promise();
        return url;
    }
}