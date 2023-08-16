import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

import { Course } from './course.model';

export interface EnrollmentAttributes {
  userId: string;
  courseId: string;
  role: 'teachingAssistant' | 'instructor' | 'student';
  status: 'pending' | 'active' | 'removed';
  email: string;
}

type EnrollmentInstance = Model<EnrollmentAttributes, EnrollmentAttributes>;

export const Enrollment = sequelize.define<EnrollmentInstance>(
  'Enrollment',
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

Enrollment.belongsTo(Course, {
  constraints: false,
  as: 'course',
  foreignKey: 'courseId'
});

Course.hasMany(Enrollment, {
  constraints: false,
  as: 'enrollments',
  foreignKey: 'courseId'
});
