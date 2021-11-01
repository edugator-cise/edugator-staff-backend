import { Request, Response } from 'express';
// import { s3Client, batchClient } from '../services/aws';
// import { GetBucketLoggingRequest, PutObjectCommand } from '@aws-sdk/client-s3';
// import { SubmitJobCommand } from '@aws-sdk/client-batch';
// import { createJobCommand } from '../../config/batchenv';
import { v4 as uuidv4 } from 'uuid';
// import { BUCKET_NAME } from '../../config/vars';
const processAndTestSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uuidString = uuidv4();
  const isoString = new Date().toISOString();
  // const createDirectoryCommand = new PutObjectCommand({
  //   Bucket: BUCKET_NAME,
  //   Key: uuidString + '/'
  // });
  const { problemID, email } = req.query;

  // const uploadZipFileCommand = new PutObjectCommand({
  //   Bucket: BUCKET_NAME,
  //   Key: isoString + '/file-submission.zip',
  //   Body: req.file.buffer
  // });

  res.status(200).send({ problemID, email, uuidString, isoString });

  // const submitJobCommand = new SubmitJobCommand(
  //   createJobCommand(uuidString, problemID as string, email as string)
  // );
  // try {
  //   await s3Client.send(createDirectoryCommand);
  //   await s3Client.send(uploadZipFileCommand);
  //   await batchClient.send(submitJobCommand);

  //   res.sendStatus(200);
  // } catch (error) {
  //   res.sendStatus(400);
  // }
};

export { processAndTestSubmissions };
