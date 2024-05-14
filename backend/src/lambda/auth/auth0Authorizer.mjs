import Axios from 'axios';
import jwt from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');
const { verify, decode } = jwt;

// @hungnv102: change the endpoint
const jwksUrl = 'https://dev-bsofuulqu3p5if2o.us.auth0.com/.well-known/jwks.json';

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User with token: ', jwtToken); 
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = decode(token, { complete: true });

  // TODO: Implement token verification
  const response = await Axios.get(jwksUrl);
  const keys = response.data.keys;
  const jwtSignKeys = keys.find(key => key.kid === jwt.header.kid);
  logger.info('jwtSignKeys', jwtSignKeys);

  if (!jwtSignKeys) {
    throw new Error("No keys found in the JWT endpoint");
  }

  const pemData = jwtSignKeys.x5c[0];
  const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`;
  const verifiedToken = verify(token, cert, { algorithms: ['RS256'] });
  logger.info('verifiedToken', verifiedToken);

  return verifiedToken;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}