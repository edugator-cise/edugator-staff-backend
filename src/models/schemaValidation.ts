const Joi = require('@hapi/joi');

const moduleValidation = (data) => {
  const schema = Joi.object({
      name: Joi.string().min(1).required(),
      number: Joi.number().min(1).required(),
      problem: Joi.array().items(Joi.objectId()).required(),
  });

  return schema.validate(data);
};

const problemValidation = (data) => {
    const schema = Joi.object({
        problemType: Joi.string().required(),
        title: Joi.string().min(1).required(),
        hidden: Joi.boolean().required(),
        language: Joi.string().min(1).required(),
        //Need to ask Hamish about that type
        dueDate: Joi.date().iso().required(),
        code: {
            header: Joi.string().min(1).required(),
            body: Joi.string().min(1).required(),
            footer: Joi.string().min(1).required(),
        },
        fileExtention: Joi.string().enum([".java", ".cpp", ".h"]).min(1).required(), //NO IDEA WHAT TO PUT HERE
        testCases: Joi.array().items(
            {
                input: Joi.string().min(1).required(),
                expectedOutput: Joi.string().min(1).required(),
                hint: Joi.string().min(1).required(),
                visibility: Joi.number().enum([0,1,2]).required(), // I think this is right
                //templatePackage: Joi.string().min(1).required(), -- Still not sure of this one yet
            },
        ),
        timeLimit: Joi.number().required(),
        memoryLimit: Joi.number().required(),
        buildCommand: Joi.string().min(1).required(),
    });
  
    return schema.validate(data);
};

module.exports.moduleValidation = moduleValidation;
module.exports.problemValidation = problemValidation;