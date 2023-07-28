import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

export interface InvitationAttributes {
  userId: string;
  courseId: string;
  role: 'teachingAssistant' | 'instructor' | 'student';
  status: 'pending' | 'active' | 'removed';
  email: string;
}

type InvitationInstance = Model<InvitationAttributes, InvitationAttributes>;

export const Invitation = sequelize.define<InvitationInstance>(
  'Invitation',
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
