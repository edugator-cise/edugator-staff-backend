import { CreationOptional, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyHasAssociationMixin, HasManyRemoveAssociationMixin, HasManySetAssociationsMixin, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database_v2';
import { Course } from './course.model';
import { HasManyGetAssociationsMixin } from 'sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  role: string;
}


export type UserAttributesInput = Optional<
  UserAttributes,
  'email'
>;

class User1 extends Model<UserAttributes, UserAttributesInput> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare role: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;


  declare getCourses: HasManyGetAssociationsMixin<Course>;
  declare addCourse: HasManyAddAssociationMixin<Course, string>;
  declare addCourses: HasManyAddAssociationsMixin<Course, string>;
  declare setCourses: HasManySetAssociationsMixin<Course, string>;
  declare removeCourse: HasManyRemoveAssociationMixin<Course, string>;
  declare hasProject: HasManyHasAssociationMixin<Course, string>;

}

type UserInstance = Model<UserAttributes, UserAttributesInput>;

export const User = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    freezeTableName: true
  }
);

export const User_Course = sequelize.define('User_Course', {}, { timestamps: false});
User.belongsToMany(Course, { through: User_Course});
Course.belongsToMany(User, { through: User_Course});

const blah = await User.create({ email: "blah"})
blah.addCou