import deserializer from './XMLRPCDeserializer';
import serializer from './XMLRPCSerializer';
import type {XMLRPCValue} from './XMLRPCSerializer';
import axios from 'axios';

export const sendXmlRPCMethodCall = async (
  config: {url: string; username: string; password: string},
  methodName: string,
  params: XMLRPCValue[],
) => {
  if (!config.url) throw new Error('Host missing for XMLRPC connection');

  const xml = serializer.serializeSync(methodName, params);
  const xmlrpcURL = config.url;
  const username = config.username;
  const password = config.password;
  const docHeaders = username
    ? {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'text/xml',
      }
    : {
        'Content-Type': 'text/xml',
      };
  try {
    const res = await axios.post(xmlrpcURL, xml, {headers: docHeaders});
    return deserializer.deserialize(res.data);
  } catch (e) {
    throw e;
  }
};
