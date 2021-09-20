import * as Joi from 'joi';

//eslint-disable-next-line
const runValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    source_code: Joi.string().required(),
    language_id: Joi.number().required(),
    base_64: Joi.boolean().required(),
    stdin: Joi.string().required()
  });
  return schema.validate(data);
};

export default runValidation;
