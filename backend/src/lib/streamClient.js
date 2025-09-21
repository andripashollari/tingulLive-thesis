import { StreamClient } from '@stream-io/node-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const client = new StreamClient(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
