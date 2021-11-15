import * as Joi from 'joi';

//eslint-disable-next-line
const moduleValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().required(),
    number: Joi.number().min(1).required()
  });

  return schema.validate(data);
};

export default moduleValidation;
