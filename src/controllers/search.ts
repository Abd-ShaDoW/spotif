import { Request, Response } from 'express';
import client from '../config/elasticsearchClient';

const searchController = async (req: Request, res: Response) => {
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

    const response = await client.search(searchParams);

    const body = response.hits.hits;

    return res.status(200).json(body);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ e: 'Search failed' });
  }
};

export default searchController;
