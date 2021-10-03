import { Request, Response } from 'express';
import { Module } from '../models/module.model';

// const httpStatus = require('http-status');

export const getModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  let modules: any;
  try {
    //Find exact problem if the moduleId is given in the params
    //The .select command excludes the problems field from the response
    if (req.params.moduleId) {
      modules = await Module.findOne({
        _id: req.params.moduleId
      }).select('-problems');
    } else {
      //Find All modules
      modules = await Module.find().select('-problems');
    }
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const getModulesWithProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
  let modules: any;
  try {
    if (req.params.moduleId) {
      res
        .status(400)
        .type('json')
        .send('This route should not be called with a moduleId');
    } else {
      //Find All modules
      modules = await Module.find().populate('problems');
    }
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const postModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const module = await Module.create(req.body);
    res.status(200).send(
      JSON.stringify({
        id: module._id
      })
    );
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const putModule = async (req: Request, res: Response): Promise<void> => {
  // makes sure there is a moduleId given in the params
  if (req.params.moduleId) {
    const module = await Module.findByIdAndUpdate(
      {
        _id: req.params.moduleId
      },
      req.body,
      { new: true }
    ).select('-problems');
    if (module) {
      res.status(200).type('json').send(module);
    } else {
      res.status(404).type('json').send({ error: 'Module not found' });
    }
  } else {
    res
      .status(404)
      .type('json')
      .send({ error: 'No moduleId given in parameters' });
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.params.moduleId) {
      const module = await Module.findOne({
        hidden: false,
        _id: req.params.moduleId
      });
      await module.delete();
      // res.send(module.toJSON());
      if (module != null) {
        res
          .status(200)
          .type('json')
          .send(
            'Module with id: ' + req.params.moduleId + ' successfully deleted'
          );
      } else {
        res
          .status(404)
          .type('json')
          .send({ error: 'Module with given id is not found' });
      }
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};
