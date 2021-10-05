import { Request, Response } from 'express';
import { s3Client, batchClient } from '../services/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { SubmitJobCommand } from '@aws-sdk/client-batch';
import { v4 as uuidv4 } from 'uuid';
import { BUCKET_NAME, judgeURI, EDUGATOR_API_PASS, EDUGATOR_API_USER, access_key_id, secret_access_key } from '../../config/vars';
const processAndTestSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uuidString = uuidv4();
  const createDirectoryCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uuidString + '/'
  });
  const { problemID, email } = req.query

  const uploadZipFileCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uuidString + '/file-submission.zip',
    Body: req.file.buffer
  });

  const submitJobCommand = new SubmitJobCommand({
    jobDefinition: "batch_test_grader:3",
    jobName: "grade_submissions", 
    jobQueue: "batch-queue",
    containerOverrides: {
      environment: [
        {
          name:"INPUT_BUCKET",
          value: BUCKET_NAME
        },
        {
          name: "FOLDER_NAME",
          value: uuidString
        },
        {
          name: "FILE_SUBMISSION_NAME",
          value: "file-submission.zip",
        },
        {
          name: "REGION_AWS",
          value: "us-east-1"
        },
        {
          name: "PROBLEMID",
          value: problemID
        },
        {
          name: "EDUGATOR_API_USER",
          value: EDUGATOR_API_USER
        },
        {
          name: "EDUGATOR_API_PASS",
          value: EDUGATOR_API_PASS
        },
        {
          name: "JUDGE_URL",
          value: judgeURI
        },
        {
          name: "EMAIL_TO_SEND",
          value: email
        },
        {
          name: "AWS_ACCESS_KEY_ID",
          value: access_key_id
        },
        {
          name: "AWS_SECRET_ACCESS_KEY",
          value: secret_access_key
        }
      ]
    }
  })
  try {
    await s3Client.send(createDirectoryCommand);
    await s3Client.send(uploadZipFileCommand);
    await batchClient.send(submitJobCommand);


    res.sendStatus(200);
  } catch (error) {
    console.error(error)
    res.sendStatus(400);
  }
};

export { processAndTestSubmissions };
