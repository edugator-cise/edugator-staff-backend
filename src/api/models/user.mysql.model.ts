import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

// Remains null until buildUserTable is called
let UserTable: any = null;

const buildUserTable = async () => {
  if (UserTable != null) {
    return; // already built
  }
  await sequelize.authenticate();
  UserTable = sequelize.define(
    'User',
    {
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

export { UserTable, buildUserTable };
