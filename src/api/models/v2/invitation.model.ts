import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

export interface InvitationAttributes {
  id: string;
  courseId: string;
  role: 'teachingAssistant' | 'instructor' | 'student';
  status: 'pending' | 'active' | 'removed';
  email: string;
}

export type InvitationAttributesInput = Optional<InvitationAttributes, 'id'>;

type InvitationInstance = Model<InvitationAttributes, InvitationAttributes>;

export const Invitation = sequelize.define<InvitationInstance>(
  'Invitation',
  {
    id: {
      type: DataTypes.STRING,
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
