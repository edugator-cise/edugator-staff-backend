import * as Joi from 'joi';

const submissionValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    source_code: Joi.string().required(),
    language_id: Joi.number().required(),
    base_64: Joi.boolean().required(),
    stdin: Joi.string().allow('').required(),
    problemId: Joi.string().required(),
    compiler_options: Joi.string().allow(''),
    memory_limit: Joi.number(),
    cpu_time_limit: Joi.number()
  });
  return schema.validate(data);
};

export default submissionValidation;
