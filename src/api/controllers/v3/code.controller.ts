import { Request, Response } from 'express';
import { AxiosError, AxiosResponse } from 'axios';
import { ValidationResult } from 'joi';

import runValidation from '../../validation/run.validation';
import submissionValidation from '../../validation/submission.validation';
import { tokenValidation } from '../../validation/tokenPayload.validation';
import { TestCaseVisibility } from '../../validation/problem.validation';
import { openSockets } from '../../../config/express';

import { judgeEngine, SubmissionPayload } from '../../services/judge0';

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

// maps the auth tokens to the submission tokens
const authorizationMapping = new Map<string, string>();

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
    compiler_options,
    callback_url: 'https://edugator.prayujt.com/api/v2/code/run/complete'
  };

  try {
    const axiosResponse: AxiosResponse = await judgeEngine.createSubmission(
      payload,
      base_64
    );
    authorizationMapping.set(
      axiosResponse.data.token,
      req.get('Authorization')
    );

    return response.send(axiosResponse.data).status(200);
  } catch (axiosError) {
    const errorCode = axiosError.response
      ? axiosError.response!.status
      : undefined;
    const errorMessage = axiosError.message;
    return response.status(errorCode).send(errorMessage);
  }
};

const handleRunComplete = async (
  req: Request,
  response: Response
): Promise<Response> => {
  const token = authorizationMapping.get(req.body.token);
  if (!token || !openSockets.has(token)) return response.sendStatus(500);
  openSockets.get(token).send(JSON.stringify(req.body));
  openSockets.delete(token);
  authorizationMapping.delete(req.body.token);
  return response.sendStatus(200);
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
      const errorCode = axiosError.response!.status;
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
      const errorCode = axiosError.response!.status;
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
    if (!problem) return response.status(404).send();

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
    const getTokens = options.map(async (opt) => {
      const payload: SubmissionPayload = {
        language_id: opt.language_id,
        source_code: opt.source_code,
        stdin: opt.stdin,
        cpu_time_limit,
        memory_limit,
        compiler_options,
        callback_url:
          'https://edugator.prayujt.com/api/v2/code/run/evaluate/complete'
      };
      try {
        const axiosResponse: AxiosResponse = await judgeEngine.createSubmission(
          payload,
          opt.base_64
        );
        return {
          token: axiosResponse.data.token,
          stdin: opt.stdin,
          expectedOutput: opt.expectedOutput,
          hidden: opt.hidden,
          hint: opt.hint,
          code: '200'
        };
      } catch (axiosError) {
        return {
          token: undefined,
          stdin: opt.stdin,
          expectedOutput: opt.expectedOutput,
          hidden: opt.hidden,
          hint: opt.hint,
          code: axiosError.code
        };
      }
    });

    // runs the judge0 api calls to get token payload
    const arrayTokenPayload = await Promise.all(getTokens);

    arrayTokenPayload.forEach((tokenPayload) => {
      authorizationMapping.set(tokenPayload.token, req.get('Authorization'));
    });

    return response.send(arrayTokenPayload).status(200);
  } catch (e) {
    return response.sendStatus(500);
  }
};

const handleSubmitComplete = async (
  req: Request,
  response: Response
): Promise<Response> => {
  const token = authorizationMapping.get(req.body.token);
  if (!token || !openSockets.has(token)) return response.sendStatus(500);
  openSockets.get(token).send(JSON.stringify(req.body));

  authorizationMapping.delete(req.body.token);
  if (![...authorizationMapping.values()].includes(token))
    openSockets.delete(token);
  return response.sendStatus(200);
};

export {
  getCode,
  runCode,
  handleRunComplete,
  deleteCode,
  submitCode,
  handleSubmitComplete,
  judge0Interrupt,
  judge0Validator,
  submissionValidator,
  outputValidator,
  createErrObject,
  createPassFailObject
};
