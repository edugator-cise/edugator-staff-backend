import * as Joi from 'joi';

const userValidation = (
  data: any,
  updateValidation: Boolean
): Joi.ValidationResult => {
  if (!updateValidation) {
    const schema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().valid('Professor', 'TA').required()
    });
    return schema.validate(data);
  } else {
    const schema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string().email().required(),
      role: Joi.string().valid('Professor', 'TA').required()
    });
    return schema.validate(data);
  }
};

export default userValidation;
