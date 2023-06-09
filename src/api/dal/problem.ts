import {
  ProblemAttributesInput,
  ProblemAttributes,
  Problem
} from '../models/problemv2.model';

export const create = async (
  payload: ProblemAttributesInput
): Promise<ProblemAttributes> => {
  const problem = await Problem.create(payload);
  return problem.dataValues;
};

export const getById = async (id: string): Promise<ProblemAttributes> => {
  const problem = await Problem.findByPk(id);
  return problem ? problem.dataValues : null;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Problem.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: ProblemAttributesInput
): Promise<ProblemAttributes | undefined> => {
  const problem = await Problem.findByPk(id);
  if (!problem) {
    return undefined;
  }
  const updatedProblem = await problem.update(payload);
  return updatedProblem.dataValues;
};

export const getAll = async (): Promise<ProblemAttributes[]> => {
  const problems = await Problem.findAll();
  return problems.map((value) => value.dataValues);
};
