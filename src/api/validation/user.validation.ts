import * as Joi from 'joi';

const userValidation = (
  data: any,
  updateValidation: boolean
): Joi.ValidationResult => {
  if (!updateValidation) {
    const schema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().valid('Administrator', 'Professor', 'TA').required()
    });
    return schema.validate(data);
  } else {
    const schema = Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().required(),
      username: Joi.string().email().required(),
      role: Joi.string().valid('Administrator', 'Professor', 'TA').required()
    });
    return schema.validate(data);
  }
};

export default userValidation;
