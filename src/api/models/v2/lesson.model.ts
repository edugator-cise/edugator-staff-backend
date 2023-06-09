import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/databasev2';
import { Module } from './module.model';

export interface LessonAttributes {
  id: string;
  title: string;
  content: string;
  hidden: boolean;
  moduleId?: string;
  orderNumber: number;
}

export type LessonAttributesInput = Optional<LessonAttributes, 'id'>;

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
  foreignKey: 'id'
});

Module.hasMany(Lesson, {
  constraints: false,
  as: 'lessons',
  foreignKey: 'moduleId'
});
