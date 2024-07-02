"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearchClient_1 = __importDefault(require("../config/elasticsearchClient"));
const searchController = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ e: 'Query is required' });
        }
        // Search parameters
        const searchParams = {
            index: ['artists', 'albums', 'songs'],
            body: {
                query: {
                    multi_match: {
                        query,
                        fields: ['name^100', 'artist.name^3', 'title^2'],
                        fuzziness: '0',
                    },
                },
            },
        };
        const response = await elasticsearchClient_1.default.search(searchParams);
        const body = response.hits.hits;
        return res.status(200).json(body);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ e: 'Search failed' });
    }
};
exports.default = searchController;
//# sourceMappingURL=search.js.map