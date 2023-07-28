import { Request, Response } from 'express';
import { AxiosError, AxiosResponse } from 'axios';
import { ValidationResult } from 'joi';

import runValidation from '../../validation/run.validation';
import submissionValidation from '../../validation/submission.validation';
import { tokenValidation } from '../../validation/tokenPayload.validation';
import { TestCaseVisibility } from '../../validation/problem.validation';

import {
  judgeEngine,
  JudgeServer,
  SubmissionPayload
} from '../../services/judge0';

import * as ProblemDataLayer from '../../dal/problem';

declare interface IJudge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string;
  memory: number | null;
  token: string;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

// Judge0 Validation https://ce.judge0.com/
// status id === 3 means code was accepted and run
const judge0Validator = ({ data }: { data: IJudge0Response }): boolean => {
  return data.status.id >= 3;
};

// Compilation error or server error
const judge0Interrupt = (data: IJudge0Response): boolean => {
  return data.status.id > 3;
};

// gets stdout if available else its a server, compilation error or in queue
const outputValidator = (data: IJudge0Response, base64: boolean) => {
  if (data.status.id === 3) {
    return base64
      ? Buffer.from(data.stdout || '', 'base64').toString()
      : data.stdout;
  } else if (judge0Interrupt(data)) {
    return data.status.description;
  } else {
    return 'Queue submission full please try again';
  }
};

// compares expected output to stdout from judge0 submission
const submissionValidator = (
  data: IJudge0Response,
  expectedOutput: string,
  base64: boolean
) => {
  if (data.status.id !== 3) {
    return false;
  } else {
    return base64
      ? Buffer.from(data.stdout || '', 'base64').toString() ===
          Buffer.from(expectedOutput || '', 'base64').toString()
      : data.stdout === expectedOutput;
  }
};

// creates error object if submission didn't run through
const createErrObject = (
  hidden: number,
  stdin: string,
  expectedOutput: string,
  base64: boolean,
  hint: string
) => {
  return {
    stdin:
      hidden === TestCaseVisibility.IO_HIDDEN
        ? 'hidden'
        : base64
        ? Buffer.from(stdin || '', 'base64').toString()
        : stdin,
    output: 'Server Error',
    hint,
    expectedOutput:
      hidden === TestCaseVisibility.IO_HIDDEN ||
      hidden == TestCaseVisibility.I_VISIBLE_O_HIDDEN
        ? 'hidden'
        : base64
        ? Buffer.from(expectedOutput || '', 'base64').toString()
        : expectedOutput,
    result: false
  };
};

const createPassFailObject = (
  data: IJudge0Response,
  hidden: number,
  stdin: string,
  expectedOutput: string,
  base64: boolean,
  hint: string
) => {
  return {
    stdin:
      hidden === 0
        ? 'hidden'
        : base64
        ? Buffer.from(stdin || '', 'base64').toString()
        : stdin,
    output:
      hidden == TestCaseVisibility.IO_VISIBLE
        ? outputValidator(data, base64)
        : 'hidden',
    hint,
    expectedOutput:
      hidden === 0 || hidden == 1
        ? 'hidden'
        : base64
        ? Buffer.from(expectedOutput || '', 'base64').toString()
        : expectedOutput,
    result: submissionValidator(data, expectedOutput, base64)
  };
};

// custom polling function
// polls requests based on max attempts/timeouts
// with a validator to check if result is viable
const poll = async (
  requestClass: JudgeServer,
  payload: any,
  validate: (value: any) => boolean,
  interval: number,
  maxAttempts: number
) => {
  let attempts = 0;

  const executePoll = async (resolve: any, reject: any) => {
    const result = await requestClass.getSubmissionVariant(payload);
    attempts++;
    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts == maxAttempts) {
      return reject(new Error('Exceeded max Attempts'));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};

const runCode = async (req: Request, response: Response): Promise<Response> => {
  const validationResponse: ValidationResult = runValidation(req.body);
  if (validationResponse.error) {
    return response.sendStatus(400);
  }

  const {
    source_code,
    language_id,
    base_64,
    stdin,
    problemId,
    cpu_time_limit,
    memory_limit,
    compiler_options
  } = req.body;

  // find the problem
  const problem = await ProblemDataLayer.getById(problemId, true);
  if (!problem) {
    return response.status(404).send();
  }

  const header = problem.codeHeader;
  const footer = problem.codeFooter;

  let fullCode = '';
  if (base_64) {
    fullCode =
      header + Buffer.from(source_code || '', 'base64').toString() + footer;
    fullCode = Buffer.from(fullCode || '', 'utf-8').toString('base64');
  } else {
    fullCode = header + source_code + footer;
  }
  const payload: SubmissionPayload = {
    language_id,
    source_code: fullCode,
    stdin,
    cpu_time_limit,
    memory_limit,
    compiler_options
  };

  try {
    const axiosResponse = await judgeEngine.createSubmission(payload, base_64);

    return response.send(axiosResponse.data).status(200);
  } catch (axiosError) {
    const errorCode = axiosError.response ? axiosError.response!.status : 500;
    const errorMessage = axiosError.message;
    return response.status(errorCode).send(errorMessage);
  }
};

const deleteCode = async (
  req: Request,
  response: Response
): Promise<Response> => {
  // TODO: Add logger
  const { token, base64 } = req.query;
  return judgeEngine
    .deleteSubmission(token as string, base64 === 'true')
    .then((axiosResponse: AxiosResponse) => {
      return response.send(axiosResponse.data).status(200);
    })
    .catch((axiosError: AxiosError) => {
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const errorCode = axiosError.response ? axiosError.response!.status : 500;
      const errorMessage = axiosError.message;
      return response.status(errorCode).send(errorMessage);
    });
};

const getCode = async (req: Request, response: Response): Promise<Response> => {
  // TODO: Add logger
  const tokenValidationResponse = tokenValidation(req.body);
  if (tokenValidationResponse.error) {
    return response.sendStatus(400);
  }
  const { runId, base_64 } = req.body;

  return judgeEngine
    .getSubmission(runId, base_64)
    .then((axiosResponse: AxiosResponse) => {
      return response.send(axiosResponse.data).status(200);
    })
    .catch((axiosError: AxiosError) => {
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const errorCode = axiosError.response ? axiosError.response!.status : 500;
      const errorMessage = axiosError.message;
      return response.status(errorCode).send(errorMessage);
    });
};

interface CodeSubmission {
  source_code: string;
  language_id: number;
  base_64: boolean;
  stdin: string;
  expectedOutput: string;
  hidden: number;
  hint: string;
}
const submitCode = async (
  req: Request,
  response: Response
): Promise<Response> => {
  const validationResponse: ValidationResult = submissionValidation(req.body);
  if (validationResponse.error) {
    return response.sendStatus(400);
  }
  const {
    source_code,
    language_id,
    base_64,
    problemId,
    cpu_time_limit,
    memory_limit,
    compiler_options
  } = req.body;
  try {
    // find the problem
    const problem = await ProblemDataLayer.getById(problemId, true);
    if (!problem) {
      return response.status(404).send();
    }
    const testCases = problem.testCases;
    const header = problem.codeHeader;
    const footer = problem.codeFooter;

    let fullCode = '';
    if (base_64) {
      // have to decode and recode header + code + footer
      fullCode =
        header + Buffer.from(source_code || '', 'base64').toString() + footer;
      fullCode = Buffer.from(fullCode || '', 'utf-8').toString('base64');
    } else {
      fullCode = header + source_code + footer;
    }
    // create an array payload for judge0 create submissions
    const options: CodeSubmission[] = testCases.map((value) => ({
      source_code: fullCode,
      language_id,
      base_64,
      stdin: Buffer.from(value.input || '', 'utf-8').toString('base64'),
      expectedOutput: Buffer.from(value.expectedOutput || '', 'utf-8').toString(
        'base64'
      ),
      hint: value.hint,
      hidden: value.visibility
    }));

    // makes promise calls for judgeEngine tokens
    const getTokens = options.map((opt) => {
      const payload: SubmissionPayload = {
        language_id: opt.language_id,
        source_code: opt.source_code,
        stdin: opt.stdin,
        cpu_time_limit,
        memory_limit,
        compiler_options
      };
      return judgeEngine
        .createSubmission(payload, opt.base_64)
        .then((axiosResponse: AxiosResponse) => ({
          token: axiosResponse.data.token,
          stdin: opt.stdin,
          expectedOutput: opt.expectedOutput,
          hidden: opt.hidden,
          hint: opt.hint,
          code: '200'
        }))
        .catch((e: AxiosError) => ({
          token: undefined,
          stdin: opt.stdin,
          expectedOutput: opt.expectedOutput,
          hidden: opt.hidden,
          hint: opt.hint,
          code: e.code
        }));
    });

    // runs the judge0 api calls to get token payload
    const arrayTokenPayload = await Promise.all(getTokens);
    //create payload and array for polling submissions with tokens
    const arrayStatusPayload = arrayTokenPayload.map((tokenObject) => {
      const load = {
        token: tokenObject.token,
        base64: true
      };
      return poll(judgeEngine, load, judge0Validator, 3000, 10)
        .then((response: AxiosResponse) => {
          const { data }: { data: IJudge0Response } = response;
          return createPassFailObject(
            data,
            tokenObject.hidden,
            tokenObject.stdin,
            tokenObject.expectedOutput,
            base_64,
            tokenObject.hint
          );
        })
        .catch(() => {
          return createErrObject(
            tokenObject.hidden,
            tokenObject.stdin,
            tokenObject.expectedOutput,
            base_64,
            tokenObject.hint
          );
        });
    });

    // runs all token fetch requests concurrently and awaits for all values
    return await Promise.all(arrayStatusPayload)
      .then(async (values) => {
        const deletePayload = arrayTokenPayload.map((tokenObject) =>
          judgeEngine
            .deleteSubmission(tokenObject.token, true)
            .then(() => {
              //TODO add logger
            })
            .catch(() => {
              //TODO add logger
            })
        );
        await Promise.all(deletePayload);
        return response.status(200).send(values);
      })
      .catch(() => response.sendStatus(500));
  } catch (e) {
    return response.sendStatus(500);
  }
};

export {
  runCode,
  getCode,
  submitCode,
  deleteCode,
  judge0Interrupt,
  judge0Validator,
  submissionValidator,
  outputValidator,
  createErrObject,
  createPassFailObject,
  poll
};
