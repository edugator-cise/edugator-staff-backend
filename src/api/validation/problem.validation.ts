import {
  ValidationResult,
  object,
  string,
  boolean,
  date,
  array,
  number
} from 'joi';

enum TestCaseVisibility {
  IO_HIDDEN = 0,
  I_VISIBLE_O_HIDDEN = 1,
  IO_VISIBLE = 2
}

const validateTestCases = (testCases: any) => {
  return (
    testCases.length > 0 &&
    testCases.some(
      (testCase) => testCase['visibility'] === TestCaseVisibility.IO_VISIBLE
    )
  );
};

//Joi does not allow empty strings by default (Reason why 'min(1)' is not in the validation for strings)
const problemValidation = (data: any): ValidationResult => {
  const schema = object({
    moduleId: number().required(),
    statement: string().required(),
    title: string().required(),
    hidden: boolean().required(),
    language: string().required(),
    dueDate: date().iso().required(),
    code: {
      header: string().allow('').required(),
      body: string().allow('').required(),
      footer: string().allow('').required(),
      problemId: number()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().required(),
      expectedOutput: string().allow('').required(),
      hint: string().allow('').required(),
      visibility: number().valid(0, 1, 2).required(),
      problemId: number()
    }),
    templatePackage: string().uri().required(),
    timeLimit: number(),
    memoryLimit: number(),
    buildCommand: string().allow('')
  });

  return schema.validate(data);
};

const problemValidationWithoutIdsRequired = (data: any): ValidationResult => {
  const schema = object({
    moduleId: number(),
    statement: string().required(),
    title: string().required(),
    hidden: boolean().required(),
    language: string().required(),
    dueDate: date().iso().required(),
    code: {
      header: string().allow('').required(),
      body: string().allow('').required(),
      footer: string().allow('').required(),
      problemId: number()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().required(),
      expectedOutput: string().allow('').required(),
      hint: string().allow('').required(),
      visibility: number().valid(0, 1, 2).required(),
      problem: number()
    }),
    templatePackage: string().uri().required(),
    timeLimit: number(),
    memoryLimit: number(),
    buildCommand: string().allow('')
  });

  return schema.validate(data);
};

export {
  problemValidation,
  problemValidationWithoutIdsRequired,
  validateTestCases,
  TestCaseVisibility
};
