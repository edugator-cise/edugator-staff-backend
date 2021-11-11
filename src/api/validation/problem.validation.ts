import {
  ValidationResult,
  object,
  string,
  boolean,
  date,
  array,
  number
} from 'joi';

//eslint-disable-next-line
//Joi does not allow empty strings by default (Reason why 'min(1)' is not in the validation for strings)
const problemValidation = (data: any): ValidationResult => {
  const schema = object({
    moduleId: string().min(24).max(24).required(),
    statement: string().required(),
    title: string().required(),
    hidden: boolean().required(),
    language: string().required(),
    dueDate: date().iso().required(),
    code: {
      header: string().allow('').required(),
      body: string().allow('').required(),
      footer: string().allow('').required()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().required(),
      expectedOutput: string().min(1).required(),
      hint: string().allow('').required(),
      visibility: number().valid(0, 1, 2).required()
    }),
    templatePackage: string().uri().required(),
    timeLimit: number(),
    memoryLimit: number(),
    buildCommand: string()
  });

  return schema.validate(data);
};

const problemValidationWithoutModuleId = (data: any): ValidationResult => {
  const schema = object({
    moduleId: string().min(24).max(24),
    statement: string().required(),
    title: string().required(),
    hidden: boolean().required(),
    language: string().required(),
    dueDate: date().iso().required(),
    code: {
      header: string().allow('').required(),
      body: string().allow('').required(),
      footer: string().allow('').required()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().required(),
      expectedOutput: string().min(1).required(),
      hint: string().allow('').required(),
      visibility: number().valid(0, 1, 2).required()
    }),
    templatePackage: string().uri().required(),
    timeLimit: number(),
    memoryLimit: number(),
    buildCommand: string()
  });

  return schema.validate(data);
};

export { problemValidation, problemValidationWithoutModuleId };
