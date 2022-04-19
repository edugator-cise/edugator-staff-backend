import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { IProblem } from './problem.mysql.model';

interface Module {
  name: string;
  number: number;
  problems: IProblem[];
}

interface IModule extends Module {
  id: number; // TODO: Convert to _id
}

// Remains null until buildModuleTable is called
let ModuleTable: any = null;

const buildModuleTable = async () => {
  if (ModuleTable != null) {
    return; // already built
  }
  ModuleTable = sequelize.define(
    'Module',
    {
      // TODO: This needs to be renamed to _id to be compatible with frontend
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

export { ModuleTable, buildModuleTable, Module, IModule };
