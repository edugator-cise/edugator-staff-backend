import AWS from 'aws-sdk'
import { BUCKET_NAME } from '../../config/vars';
import * as multer from 'multer';
const s3 = new AWS.S3();
const uploader = multer({
  limits: {
    fileSize: 100000
  },
  storage: multer.memoryStorage()
});

const params = {
  Bucket: BUCKET_NAME,
  Key: ''
}


