import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { ModuleTable } from './module.mysql.model';

interface TestCase {
  input: string;
  expectedOutput: string;
  hint: string;
  visibility: number;
  problemId: number;
}

interface Code {
  header?: string;
  body?: string;
  footer?: string;
  problemId: number;
}

interface Problem {
  statement: string;
  title: string;
  hidden: boolean;
  language: string;
  dueDate: Date;
  fileExtension: string;
  templatePackage: string;
  timeLimit?: number;
  memoryLimit?: number;
  buildCommand?: string;
  moduleId: number;
  code: Code;
  testCases: TestCase[];
}

interface IProblem extends Problem {
  id: number;
}

// null until buildProblemTables is called
let ProblemTable: any = null;
let TestCaseTable: any = null;
let CodeTable: any = null;

const buildProblemTable = async () => {
  if (ProblemTable != null) {
    return; // already built
  }
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

const buildTestCaseTable = async () => {
  if (TestCaseTable != null) {
    return; // already built
  }
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

const buildCodeTable = async () => {
  if (CodeTable != null) {
    return; // already built
  }
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
    as: 'testCases'
  });
  ProblemTable.Codes = ProblemTable.hasOne(CodeTable, {
    foreignKey: 'problemId',
    as: 'code'
  });
};

// Build function for ProblemTable, CodeTable, and TestCaseTable
const buildProblemTables = async () => {
  await buildTables();
  relateTables();
};

export {
  buildProblemTables,
  ProblemTable,
  CodeTable,
  TestCaseTable,
  Problem,
  IProblem,
  TestCase,
  Code
};
