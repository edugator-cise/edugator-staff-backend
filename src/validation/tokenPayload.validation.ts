import * as Joi from 'joi';

//eslint-disable-next-line
const tokenValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    runId: Joi.string().min(1).required()
  });
  return schema.validate(data);
};

//eslint-disable-next-line
const base64Validation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    base_64: Joi.boolean().required()
  });
  return schema.validate(data);
};
export { tokenValidation, base64Validation };
