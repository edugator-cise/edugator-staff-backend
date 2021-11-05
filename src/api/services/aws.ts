import { S3Client } from '@aws-sdk/client-s3';
import { BatchClient } from '@aws-sdk/client-batch';
import { access_key_id, secret_access_key } from '../../config/vars';
const creds = {
  accessKeyId: access_key_id,
  secretAccessKey: secret_access_key
};

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: creds
});

const batchClient = new BatchClient({
  region: 'us-east-1',
  credentials: creds
});
export { s3Client, batchClient };
