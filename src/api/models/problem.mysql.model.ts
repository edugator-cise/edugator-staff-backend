import { DataTypes, TINYINT } from 'sequelize';
import { sequelize } from '../../config/database';
import { buildModuleTable, ModuleTable } from './module.mysql.model';

let ProblemTable: any = null;

const buildProblemTable = async () => {
  if (ProblemTable != null) {
    return; // already built
  }
  await sequelize.authenticate();
  await buildModuleTable();
  ProblemTable = sequelize.define(
    'Problem',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      statement: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      language: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fileExtension: {
        type: DataTypes.ENUM('.java', '.cpp', '.h'),
        allowNull: false
      },
      templatePackage: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      timeLimit: {
        type: DataTypes.DOUBLE
      },
      memoryLimit: {
        type: DataTypes.DOUBLE
      },
      buildCommand: {
        type: DataTypes.STRING(500)
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Module',
          key: 'id'
        }
        // TODO: specify onDelete behavior
      }
    },
    {
      tableName: 'Problem',
      timestamps: false,
      underscored: true
    }
  );
  ProblemTable.belongsTo(ModuleTable, { foreignKey: 'module_id' });
};

let TestCaseTable: any = null;

const buildTestCaseTable = async () => {
  if (TestCaseTable != null) {
    return; // already built
  }
  await sequelize.authenticate();
  await buildProblemTable();
  TestCaseTable = sequelize.define(
    'TestCase',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      input: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      expectedOutput: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      hint: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      visibility: {
        type: TINYINT,
        allowNull: false,
        validate: {
          isIn: [[0, 1, 2]]
        }
      },
      problemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Problem',
          key: 'id'
        }
      }
    },
    {
      tableName: 'TestCase',
      timestamps: false,
      underscored: true
    }
  );

  TestCaseTable.belongsTo(ProblemTable, { foreignKey: 'problem_id' });
};

let CodeTable: any = null;

const buildCodeTable = async () => {
  if (CodeTable != null) {
    return; // already built
  }
  await sequelize.authenticate();
  await buildProblemTable();
  CodeTable = sequelize.define(
    'Code',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      header: {
        type: DataTypes.TEXT
      },
      body: {
        type: DataTypes.TEXT
      },
      footer: {
        type: DataTypes.TEXT
      },
      problemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Problem',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    {
      tableName: 'Code',
      timestamps: false,
      underscored: true
    }
  );
  CodeTable.belongsTo(ProblemTable, { foreignKey: 'problem_id' });
};

// Other files should call this function to build the tables
const buildProblem = async () => {
  await buildProblemTable();
  await buildCodeTable();
  await buildTestCaseTable();
};

export { buildProblem, ProblemTable, CodeTable, TestCaseTable };