import * as Joi from 'joi';

const runValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    source_code: Joi.string().required(),
    language_id: Joi.number().required(),
    base_64: Joi.boolean().required(),
    stdin: Joi.string().allow('').required(),
    problemId: Joi.string().required()
  });
  return schema.validate(data);
};

export default runValidation;
