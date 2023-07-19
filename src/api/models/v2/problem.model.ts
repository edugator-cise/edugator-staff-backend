import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';
import { Module } from './module.model';

export interface ProblemAttributes {
  id: string;
  title: string;
  statement: string;
  hidden: boolean;
  fileName: string;
  dueDate: string;
  codeHeader: string;
  codeBody: string;
  codeFooter: string;
  codeSolution: string;
  templatePackage: string;
  timeLimit: number;
  memoryLimit: number;
  buildCommand: string;
  difficulty: string;
  author: string;
  moduleId?: string;
  orderNumber: number; // order of the problem in the module
  testCases?: TestCaseAttributesInput[];
}

export interface TestCaseAttributes {
  id: string;
  testType: string;
  input: string;
  expectedOutput: string;
  hint: string;
  visibility: number;
  feedback: string;
  orderNumber: number; // order of the test case in the problem
  problemId?: string;
}

export type ProblemAttributesInput = Optional<
  ProblemAttributes,
  'id' | 'orderNumber'
>;
export type TestCaseAttributesInput = Optional<TestCaseAttributes, 'id'>;

type ProblemInstance = Model<ProblemAttributes, ProblemAttributesInput>;
type TestCaseInstance = Model<TestCaseAttributes, TestCaseAttributesInput>;

export const Problem = sequelize.define<ProblemInstance>(
  'Problem',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    statement: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dueDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codeHeader: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codeBody: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codeFooter: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codeSolution: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    templatePackage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timeLimit: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    memoryLimit: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    buildCommand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderNumber: {
      type: DataTypes.TINYINT,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

export const TestCase = sequelize.define<TestCaseInstance>(
  'TestCase',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    testType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expectedOutput: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    visibility: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    orderNumber: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

Problem.belongsTo(Module, {
  constraints: false,
  as: 'module',
  foreignKey: 'moduleId'
});

Module.hasMany(Problem, {
  constraints: false,
  as: 'problems',
  foreignKey: 'moduleId'
});

TestCase.belongsTo(Problem, {
  constraints: false,
  as: 'problem',
  foreignKey: 'problemId'
});

Problem.hasMany(TestCase, {
  constraints: false,
  as: 'testCases',
  foreignKey: 'problemId'
});
