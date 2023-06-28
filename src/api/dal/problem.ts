import {
  ProblemAttributesInput,
  ProblemAttributes,
  Problem,
  TestCaseAttributesInput,
  TestCaseAttributes,
  TestCase
} from '../models/v2/problem.model';

import { Op } from 'sequelize';
import { sequelize } from '../../config/database_v2';

export const create = async (
  payload: ProblemAttributesInput
): Promise<ProblemAttributes> => {
  const problem = await Problem.create(payload);
  return problem.get({ plain: true });
};

export const createTestCase = async (
  payload: TestCaseAttributesInput
): Promise<TestCaseAttributes> => {
  const testCase = await TestCase.create(payload);
  return testCase.get({ plain: true });
};

export const getById = async (id: string): Promise<ProblemAttributes> => {
  const problem = await Problem.findByPk(id, {
    include: 'testCases',
    order: [['testCases', 'orderNumber', 'ASC']]
  });
  return problem ? problem.get({ plain: true }) : null;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Problem.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const deleteByModule = async (moduleId: string): Promise<boolean> => {
  const numberOfDeletions = await Problem.destroy({
    where: { moduleId: moduleId }
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
  return updatedProblem.get({ plain: true });
};

export const getByModule = async (
  moduleId: string,
  hidden: boolean
): Promise<ProblemAttributes[]> => {
  const constraints = {
    moduleId: moduleId
  };
  if (!hidden) constraints['hidden'] = hidden;

  const problems = await Problem.findAll({
    where: constraints,
    include: 'testCases',
    order: [['testCases', 'orderNumber', 'ASC']]
  });
  return problems.map((value) => value.get({ plain: true }));
};

export const shiftProblems = async (
  moduleId: string,
  orderNumber: number,
  newOrderNumber?: number
): Promise<void> => {
  if (!newOrderNumber) {
    await Problem.update(
      { orderNumber: sequelize.literal('orderNumber - 1') },
      {
        where: {
          moduleId: moduleId,
          orderNumber: { [Op.gt]: orderNumber }
        }
      }
    );
  } else {
    await Problem.update(
      {
        orderNumber: sequelize.literal(
          orderNumber < newOrderNumber ? 'orderNumber - 1' : 'orderNumber + 1'
        )
      },
      {
        where: {
          moduleId: moduleId,
          orderNumber: {
            [Op.gte]:
              orderNumber < newOrderNumber ? orderNumber : newOrderNumber,
            [Op.lte]:
              orderNumber < newOrderNumber ? newOrderNumber : orderNumber
          }
        }
      }
    );
  }
};
