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
const problemValidation = (data: any): ValidationResult => {
  const schema = object({
    moduleId: string().required(),
    statement: string().required(),
    title: string().min(1).required(),
    hidden: boolean().required(),
    language: string().min(1).required(),
    dueDate: date().iso().required(),
    code: {
      header: string().allow('').required(),
      body: string().allow('').required(),
      footer: string().allow('').required()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().min(1).required(),
      expectedOutput: string().min(1).required(),
      hint: string().min(1).required(),
      visibility: number().valid(0, 1, 2).required()
    }),
    templatePackage: string().uri().min(1).required(),
    timeLimit: number(),
    memoryLimit: number(),
    buildCommand: string()
  });

  return schema.validate(data);
};

export default problemValidation;
