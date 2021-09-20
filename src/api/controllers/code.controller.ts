import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import runValidation from '../../validation/run.validation';
import {
  tokenValidation,
  base64Validation
} from '../../validation/tokenPayload.validation';
import { ValidationResult } from 'joi';
import { judgeEngine } from '../services/judge0';
import { AxiosError, AxiosResponse } from 'axios';
const runCode = async (req: Request, response: Response): Promise<Response> => {
  // TODO: Add logger

  const validationResponse: ValidationResult = runValidation(req.body);
  if (validationResponse.error) {
    return response.sendStatus(httpStatus.BAD_REQUEST);
  }

  const { source_code, language_id, base_64, stdin } = req.body;

  return judgeEngine
    .createSubmission(source_code, language_id, base_64, stdin)
    .then((axiosResponse: AxiosResponse) => {
      return response.send(axiosResponse.data).status(httpStatus.OK);
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

  const tokenValidationResponse = tokenValidation(req.params);
  const base64ValidationResponse = base64Validation(req.body);
  if (tokenValidationResponse.error || base64ValidationResponse.error) {
    return response.sendStatus(httpStatus.BAD_REQUEST);
  }
  const { runId } = req.params;
  const { base_64 } = req.body;

  return judgeEngine
    .getSubmission(runId, base_64)
    .then((axiosResponse: AxiosResponse) => {
      return response.send(axiosResponse.data).status(httpStatus.OK);
    })
    .catch((axiosError: AxiosError) => {
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const errorCode = axiosError.response!.status;
      const errorMessage = axiosError.message;
      return response.status(errorCode).send(errorMessage);
    });
};

export { runCode, getCode };
