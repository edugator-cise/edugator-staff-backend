import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { buildModuleTable, ModuleTable } from './module.mysql.model';

interface TestCase {
  input: string;
  expected_output: string;
  hint: string;
  visibility: number;
  problem_id: number;
}

interface Code {
  header?: string;
  body?: string;
  footer?: string;
  problem_id: number;
}

interface Problem {
  statement: string;
  title: string;
  hidden: boolean;
  language: string;
  due_date: Date;
  file_extension: string;
  template_package: string;
  time_limit?: number;
  memory_limit?: number;
  build_command?: string;
  module_id: number;
  code: Code;
  test_cases: TestCase[];
}

interface IProblem extends Problem {
  _id: number;
}

let ProblemTable: any = null;

const buildProblemTable = async () => {
  if (ProblemTable != null) {
    return; // already built
  }
  await buildModuleTable();
  ProblemTable = sequelize.define(
    'Problem',
    {
      // TODO: This needs to be renamed to _id to be compatible with frontend
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
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    {
      tableName: 'Problem',
      timestamps: false,
      underscored: true
    }
  );
};

let TestCaseTable: any = null;

const buildTestCaseTable = async () => {
  if (TestCaseTable != null) {
    return; // already built
  }
  await buildProblemTable();
  TestCaseTable = sequelize.define(
    'TestCase',
    {
      // TODO: This needs to be renamed to _id to be compatible with frontend
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
        type: DataTypes.TINYINT,
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
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    {
      tableName: 'TestCase',
      timestamps: false,
      underscored: true
    }
  );
};

let CodeTable: any = null;

const buildCodeTable = async () => {
  if (CodeTable != null) {
    return; // already built
  }
  await buildProblemTable();
  CodeTable = sequelize.define(
    'Code',
    {
      // TODO: This needs to be renamed to _id to be compatible with frontend
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
};

const buildTables = async () => {
  await buildProblemTable();
  await buildCodeTable();
  await buildTestCaseTable();
};

const relateTables = () => {
  ModuleTable.Problems = ModuleTable.hasMany(ProblemTable, {
    foreignKey: 'moduleId',
    as: 'problems'
  });
  ProblemTable.TestCases = ProblemTable.hasMany(TestCaseTable, {
    foreignKey: 'problemId',
    as: 'testCases' // not 'TestCases'
  });
  ProblemTable.Codes = ProblemTable.hasOne(CodeTable, {
    foreignKey: 'problemId',
    as: 'code'
  });
};

// Other files should call this function to build the tables
const buildProblem = async () => {
  await buildTables();
  relateTables();
};

export {
  buildProblem,
  ProblemTable,
  CodeTable,
  TestCaseTable,
  Problem,
  IProblem
};
