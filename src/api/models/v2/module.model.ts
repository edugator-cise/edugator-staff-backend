import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';
import { Course } from './course.model';

export interface ModuleAttributes {
  id: string;
  moduleName: string;
  orderNumber: number;
  courseId?: string;
}

export type ModuleAttributesInput = Optional<ModuleAttributes, 'id'>;

type ModuleInstance = Model<ModuleAttributes, ModuleAttributesInput>;

export const Module = sequelize.define<ModuleInstance>(
  'Module',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    moduleName: {
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

Module.belongsTo(Course, {
  constraints: false,
  as: 'course',
  foreignKey: 'id'
});
Course.hasMany(Module, {
  constraints: false,
  as: 'modules',
  foreignKey: 'courseId'
});
