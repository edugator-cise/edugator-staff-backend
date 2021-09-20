import * as Joi from 'joi';
import JoiObjectId from 'joi-objectid';
const objectIdValidator = JoiObjectId(Joi);

//eslint-disable-next-line
const moduleValidation = (data: any): Joi.ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().min(1).required(),
    number: Joi.number().min(1).required(),
    problem: Joi.array().items(objectIdValidator()).required()
  });

  return schema.validate(data);
};

export default moduleValidation;
