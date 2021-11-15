import * as Joi from 'joi';

const tokenValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    runId: Joi.string().min(1).required(),
    base_64: Joi.boolean().required()
  });
  return schema.validate(data);
};

const base64Validation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    base_64: Joi.boolean().required()
  });
  return schema.validate(data);
};
export { tokenValidation, base64Validation };
