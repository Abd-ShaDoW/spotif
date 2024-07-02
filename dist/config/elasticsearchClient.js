"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const client = new elasticsearch_1.Client({
    node: 'http://elasticsearch:9200',
    auth: {
        username: process.env.elasticUser,
        password: process.env.elasticPass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
exports.default = client;
//# sourceMappingURL=elasticsearchClient.js.map