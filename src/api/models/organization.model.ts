import { sequelize } from '../../config/databasev2';
import { DataTypes, Model, Optional } from 'sequelize';

export interface OrganizationAttributes {
  id: string;
  name: string;
  logo: string;
}

export type OrganizationAttributesInput = Optional<
  OrganizationAttributes,
  'id'
>;

type OrganizationInstance = Model<
  OrganizationAttributes,
  OrganizationAttributesInput
>;

export const Organization = sequelize.define<OrganizationInstance>(
  'Organization',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING
    }
  },
  {
    freezeTableName: true
  }
);
