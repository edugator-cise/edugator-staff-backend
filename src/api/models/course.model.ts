import { DataTypes, Model, Optional } from "sequelize"
import { sequelize } from "../../config/databasev2"


export interface CourseAttributes {
  id: string,
  courseName: string,
  startDate: string,
  endDate: string,
  logo: string,
};

export interface CourseAttributesInput extends Optional<CourseAttributes, 'id'> {}

interface CourseInstance extends Model<CourseAttributes, CourseAttributesInput> {}

export const Course = sequelize.define<CourseInstance>(
    'Course',
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      courseName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      logo: {
        type: DataTypes.STRING,
      }
    },
    {
      freezeTableName: true
    }
  );