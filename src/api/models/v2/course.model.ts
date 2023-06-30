import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

import { Organization } from './organization.model';

export interface CourseAttributes {
  id: string;
  courseName: string;
  startDate: string;
  endDate: string;
  logo: string;
  ltiCourseLink?: string;
  organizationId?: string;
}

export type CourseAttributesInput = Optional<
  CourseAttributes,
  'id' | 'ltiCourseLink'
>;

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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ltiCourseLink: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  }
);

Course.belongsTo(Organization, {
  constraints: false,
  as: 'organization',
  foreignKey: 'id'
});

Organization.hasMany(Course, {
  constraints: false,
  as: 'courses',
  foreignKey: 'organizationId'
});
