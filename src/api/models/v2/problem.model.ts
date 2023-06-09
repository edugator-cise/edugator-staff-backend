import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/databasev2';
import { Module } from './module.model';

export interface ProblemAttributes {
  id: string;
  title: string;
  hidden: boolean;
  fileName: string;
  dueDate: string;
  header: string;
  body: string;
  footer: string;
  templatePackage: string;
  timeLimit: number;
  memoryLimit: number;
  buildCommand: string;
  moduleId?: string;
  orderNumber: number;
}

export type ProblemAttributesInput = Optional<ProblemAttributes, 'id'>;

type ProblemInstance = Model<ProblemAttributes, ProblemAttributesInput>;

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
    header: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    footer: {
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
    orderNumber: {
      type: DataTypes.TINYINT,
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
  foreignKey: 'id'
});

Module.hasMany(Problem, {
  constraints: false,
  as: 'problems',
  foreignKey: 'moduleId'
});
