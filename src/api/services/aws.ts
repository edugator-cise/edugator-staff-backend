import { S3Client } from "@aws-sdk/client-s3";
import { access_key_id, secret_access_key } from '../../config/vars';
const creds = {
  accessKeyId: access_key_id,
  secretAccessKey: secret_access_key
}

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: creds
})

export { s3Client };

// import { BUCKET_NAME } from '../../config/vars';
// const s3 = new AWS.S3();
// const uploader = multer({
//   limits: {
//     fileSize: 100000
//   },
//   storage: multer.memoryStorage()
// });

// const params = {
//   Bucket: BUCKET_NAME,
//   Key: ''
// }


