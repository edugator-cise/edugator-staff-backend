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
    problemType: string().required(),
    title: string().min(1).required(),
    hidden: boolean().required(),
    templatePackage: string().min(1).required(),
    language: string().min(1).required(),
    dueDate: date().iso().required(),
    code: {
      header: string().required(),
      body: string().required(),
      footer: string().required()
    },
    fileExtension: string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: array().items({
      input: string().min(1).required(),
      expectedOutput: string().min(1).required(),
      hint: string().min(1).required(),
      visibility: number().valid(0, 1, 2).required()
    }),
    timeLimit: number().required(),
    memoryLimit: number().required(),
    buildCommand: string().min(1).required(),
    moduleName: string().min(1).required()
  });

  return schema.validate(data);
};

export default problemValidation;
