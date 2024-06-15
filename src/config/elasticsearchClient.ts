import { Client } from '@elastic/elasticsearch';
const client = new Client({
  node: 'http://elasticsearch:9200',
  auth: {
    username: process.env.elasticUser,
    password: process.env.elasticPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default client;
