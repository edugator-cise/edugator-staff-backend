import { Request, Response } from 'express';
import { s3Client } from '../services/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { BUCKET_NAME } from '../../config/vars';
const processAndTestSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uuidString = uuidv4();
  const createDirectoryCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uuidString + '/'
  });

  const uploadZipFileCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uuidString + '/file-submission.zip',
    Body: req.file.buffer
  });

  try {
    await s3Client.send(createDirectoryCommand);
    await s3Client.send(uploadZipFileCommand);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
};

export { processAndTestSubmissions };
