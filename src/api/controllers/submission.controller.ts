import { Request, Response } from 'express';
import { s3Client } from '../services/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
const processAndTestSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uuidString = uuidv4();

  const command = new PutObjectCommand({
    Bucket: 'code-submissions-bucket',
    Key: uuidString + '.zip',
    Body: req.file.buffer
  });

  try {
    await s3Client.send(command);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
};

export { processAndTestSubmissions };
