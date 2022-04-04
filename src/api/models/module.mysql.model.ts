import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

// Remains null until buildModuleTable is called
let ModuleTable: any = null;

const buildModuleTable = async () => {
  if (ModuleTable != null) {
    return; // already built
  }
  await sequelize.authenticate();
  ModuleTable = sequelize.define(
    'Module',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      number: {
        type: DataTypes.DECIMAL(11, 1),
        allowNull: false
      }
    },
    {
      tableName: 'Module',
      timestamps: false,
      underscored: true
    }
  );
};

export { ModuleTable, buildModuleTable };
