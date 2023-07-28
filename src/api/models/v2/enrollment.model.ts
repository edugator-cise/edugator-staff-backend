import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

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
      allowNull: false
    },
    email: {
      type: DataTypes.DATE,
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
