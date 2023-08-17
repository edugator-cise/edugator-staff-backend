import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';

import { Course } from './course.model';

export interface InvitationAttributes {
  id: string;
  courseId?: string;
  role: 'teachingAssistant' | 'instructor' | 'student';
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
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

Invitation.belongsTo(Course, {
  constraints: false,
  as: 'course',
  foreignKey: 'courseId'
});

Course.hasMany(Invitation, {
  constraints: false,
  as: 'invitations',
  foreignKey: 'courseId'
});
