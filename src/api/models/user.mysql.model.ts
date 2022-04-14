import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

interface User {
  name: string;
  username: string;
  password: string;
  role: string;
}

interface IUser extends User {
  id: number;
}

// Remains null until buildUserTable is called
let UserTable: any = null;

const buildUserTable = async () => {
  if (UserTable != null) {
    return; // already built
  }
  UserTable = sequelize.define(
    'User',
    {
      // TODO: This needs to be renamed to _id to be compatible with frontend
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      salt: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('Professor', 'TA'),
        allowNull: false
      }
    },
    {
      tableName: 'User',
      timestamps: false
    }
  );
};

export { IUser, UserTable, buildUserTable };
