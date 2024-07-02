import { Client } from '@elastic/elasticsearch';
const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.elasticUser,
    password: process.env.elasticPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default client;
