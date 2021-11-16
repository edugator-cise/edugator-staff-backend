import * as Joi from 'joi';

const moduleValidation = (data: JSON): Joi.ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().required(),
    number: Joi.number().min(1).max(100).required()
  });

  return schema.validate(data);
};

export default moduleValidation;
