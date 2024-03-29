import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';
import { Module } from './module.model';

export interface LessonAttributes {
  id: string;
  title: string;
  content: string;
  hidden: boolean;
  difficulty: string;
  author: string;
  moduleId?: string;
  orderNumber: number; // order of the lesson in the module
}

export type LessonAttributesInput = Optional<
  LessonAttributes,
  'id' | 'orderNumber'
>;

type LessonInstance = Model<LessonAttributes, LessonAttributesInput>;

export const Lesson = sequelize.define<LessonInstance>(
  'Lesson',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
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

Lesson.belongsTo(Module, {
  constraints: false,
  as: 'module',
  foreignKey: 'moduleId'
});

Module.hasMany(Lesson, {
  constraints: false,
  as: 'lessons',
  foreignKey: 'moduleId'
});
