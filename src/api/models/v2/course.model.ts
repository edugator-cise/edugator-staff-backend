import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

import { Organization } from './organization.model';

export interface CourseAttributes {
  id: string;
  courseName: string;
  language: string;
  startDate: string;
  endDate: string;
  logo: string;
  organizationId?: string;
}

export type CourseAttributesInput = Optional<CourseAttributes, 'id'>;

type CourseInstance = Model<CourseAttributes, CourseAttributesInput>;

export const Course = sequelize.define<CourseInstance>(
  'Course',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    logo: {
      type: DataTypes.STRING
    }
  },
  {
    freezeTableName: true
  }
);

Course.belongsTo(Organization, {
  constraints: false,
  as: 'organization',
  foreignKey: 'organizationId'
});

Organization.hasMany(Course, {
  constraints: false,
  as: 'courses',
  foreignKey: 'organizationId'
});
