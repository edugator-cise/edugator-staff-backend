import {
  CourseAttributesInput,
  CourseAttributes
} from '../models/course.model';
import { Course } from '../models/course.model';

export const create = async (
  payload: CourseAttributesInput
): Promise<CourseAttributes> => {
  const course = await Course.create(payload);
  return course.dataValues;
};

export const getById = async (id: string): Promise<CourseAttributes> => {
  const course = await Course.findByPk(id);
  return course.dataValues;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Course.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: CourseAttributesInput
): Promise<CourseAttributes | undefined> => {
  const course = await Course.findByPk(id);
  if (!course) {
    return undefined;
  }
  const updatedCourse = await course.update(payload);
  return updatedCourse.dataValues;
};

export const getAll = async (): Promise<CourseAttributes[]> => {
  const courses = await Course.findAll();
  return courses.map((value) => value.dataValues);
};
