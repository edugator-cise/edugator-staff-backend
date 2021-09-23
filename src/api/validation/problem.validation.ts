import * as Joi from 'joi';

//eslint-disable-next-line
const problemValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    problemType: Joi.string().required(),
    title: Joi.string().min(1).required(),
    hidden: Joi.boolean().required(),
    language: Joi.string().min(1).required(),
    dueDate: Joi.date().iso().required(),
    code: {
      header: Joi.string().min(1).required(),
      body: Joi.string().min(1).required(),
      footer: Joi.string().min(1).required()
    },
    fileExtension: Joi.string().valid('.java', '.cpp', '.h').min(1).required(),
    testCases: Joi.array().items({
      input: Joi.string().min(1).required(),
      expectedOutput: Joi.string().min(1).required(),
      hint: Joi.string().min(1).required(),
      visibility: Joi.number().valid(0, 1, 2).required(),
      templatePackage: Joi.string().min(1).required()
    }),
    timeLimit: Joi.number().required(),
    memoryLimit: Joi.number().required(),
    buildCommand: Joi.string().min(1).required()
  });

  return schema.validate(data);
};

export default problemValidation;
