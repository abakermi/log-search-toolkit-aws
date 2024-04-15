
import { S3Client, GetObjectCommand,PutObjectCommand } from "@aws-sdk/client-s3"
import { S3Event, S3EventRecord } from 'aws-lambda';

const s3 = new S3Client()


const indexBucket = process.env.INDEX_BUCKET_NAME || "";


interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export const handler = async (event: S3Event): Promise<void> => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  try {
    console.log(`Indexing log file: ${key}`);
    const logData = await getLogData(bucket, key);
    const indexedData = indexLogData(logData);
    await saveIndexedData(indexedData);
    console.log(`Indexed data saved for log file: ${key}`);
  } catch (error) {
    console.error(`Error indexing log file: ${key}`, error);
    throw error;
  }
};

async function getLogData(bucket: string, key: string): Promise<string> {

  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const data = await s3.send(cmd)
  return data.Body!.transformToString();
}

function indexLogData(logData: string): LogEntry[] {
  const logEntries: LogEntry[] = [];
  const lines = logData.split('\n');

  for (const line of lines) {
    if (line.trim() !== '') {
      const [timestamp, level, ...messageParts] = line.split(' ');
      const message = messageParts.join(' ');
      logEntries.push({ timestamp, level, message });
    }
  }

  return logEntries;
}

async function saveIndexedData(indexedData: LogEntry[]): Promise<void> {

  const cmd = new PutObjectCommand({
    Bucket: indexBucket,
    Key: `${Date.now()}.json`,
    Body: JSON.stringify(indexedData),
    ContentType: 'application/json',
  });

  await s3.send(cmd);
}