import { S3Client, GetObjectCommand,ListObjectsV2Command } from "@aws-sdk/client-s3"

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const s3 = new S3Client()

const indexBucket = process.env.INDEX_BUCKET_NAME || "";


interface SearchParams {
  query: string;
  startDate: string;
  endDate: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { query, startDate, endDate } = JSON.parse(event.body!) as SearchParams;

  try {
    const indexedDataKeys = await getIndexedDataKeys(startDate, endDate);
    const searchResults = await searchIndexedData(indexedDataKeys, query);
    return {
      statusCode: 200,
      body: JSON.stringify(searchResults),
    };
  } catch (error) {
    console.error('Error searching log data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

async function getIndexedDataKeys(startDate: string, endDate: string): Promise<string[]> {

    const cmd=new ListObjectsV2Command({
        Bucket: indexBucket,
        Prefix: "",

  
    });

  const data = await s3.send(cmd);
  const keys = data.Contents!.map((obj) => obj.Key!);

  const filteredKeys = keys.filter((key) => {
    const timestamp = parseInt(key.split('.')[0], 10);

    const date = new Date(timestamp);
    console.log(key,timestamp,date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  return filteredKeys;
}

async function searchIndexedData(keys: string[], query: string): Promise<LogEntry[]> {
  const searchResults: LogEntry[] = [];

  for (const key of keys) {
    const data = await s3.send(new GetObjectCommand(
        { Bucket:indexBucket, Key: key }
    ))
    const str= await data.Body!.transformToString();

    const indexedData: LogEntry[] = JSON.parse(str);

    const matchingEntries = indexedData.filter((entry) => {
      const { timestamp, level, message } = entry;
      return (
        timestamp.includes(query) ||
        level.toLowerCase().includes(query.toLowerCase()) ||
        message.toLowerCase().includes(query.toLowerCase())
      );
    });

    searchResults.push(...matchingEntries);
  }

  return searchResults;
}