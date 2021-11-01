import * as vars from './vars';

export const createJobCommand = (
  folderName: string,
  problemID: string,
  receiverEmail: string
) => {
  return {
    jobDefinition: vars.jobDefinition,
    jobName: 'grade_submissions',
    jobQueue: vars.jobQueue,
    containerOverrides: {
      environment: [
        {
          name: 'INPUT_BUCKET',
          value: vars.BUCKET_NAME
        },
        {
          name: 'FOLDER_NAME',
          value: folderName
        },
        {
          name: 'FILE_SUBMISSION_NAME',
          value: 'file-submission.zip'
        },
        {
          name: 'REGION_AWS',
          value: vars.REGION_AWS
        },
        {
          name: 'PROBLEMID',
          value: problemID
        },
        {
          name: 'EDUGATOR_API_USER',
          value: vars.EDUGATOR_API_USER
        },
        {
          name: 'EDUGATOR_API_PASS',
          value: vars.EDUGATOR_API_PASS
        },
        {
          name: 'JUDGE_URL',
          value: vars.judgeURI
        },
        {
          name: 'SENDER_EMAIL',
          value: vars.SENDER_EMAIL
        },
        {
          name: 'AWS_ACCESS_KEY_ID',
          value: vars.access_key_id
        },
        {
          name: 'AWS_SECRET_ACCESS_KEY',
          value: vars.secret_access_key
        },
        {
          name: 'APP_PASSWORD',
          value: vars.APP_PASSWORD
        },
        {
          name: 'RECEIVER_EMAIL',
          value: receiverEmail
        },
        {
          name: 'EDUGATOR_API_URL',
          value: vars.EDUGATOR_API_URL
        },
        {
          name: 'EDUGATOR_AUTH_TOKEN',
          value: vars.EDUGATOR_AUTH_TOKEN
        }
      ]
    }
  };
};
