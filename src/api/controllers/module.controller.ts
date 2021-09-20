// import { Request, Response } from 'express';
// import ModuleModel from '../models/module.model';

// // const httpStatus = require('http-status');

// export const getModules = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let modules: any;
//   //Find exact problem if the moduleId is given in the params
//   if (req.params.moduleId) {
//     modules = await ModuleModel.findOne({
//       hidden: false,
//       _id: req.params.moduleId
//     });
//   } else {
//     //Find All modules
//     modules = await ModuleModel.find({
//       hidden: false
//     });
//   }
//   res.status(200).send(modules);
// };

// export const postModules = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const module = await ModuleModel.create(req.body);
//     res.status(200).send(module);
//   } catch (err) {
//     res.status(400).type('json').send(err);
//   }
// };

// export const putModule = async (req: Request, res: Response): Promise<void> => {
//   // makes sure there is a moduleId given in the params
//   if (req.params.moduleId) {
//     const module = await ModuleModel.findByIdAndUpdate(
//       {
//         hidden: false,
//         _id: req.params.moduleId
//       },
//       req.body
//     );
//     if (module) {
//       res.status(200).type('json').send(module);
//     } else {
//       res.status(404).type('json').send({ error: 'Module not found' });
//     }
//   } else {
//     res
//       .status(404)
//       .type('json')
//       .send({ error: 'No moduleId given in parameters' });
//   }
// };

// export const deleteModule = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     if (req.params.moduleId) {
//       const module = await ModuleModel.findOne({
//         hidden: false,
//         _id: req.params.moduleId
//       });
//       await module.delete();
//       res.send(module.toJSON());
//     }
//   } catch (err) {
//     res.status(400).type('json').send(err);
//   }
// };
