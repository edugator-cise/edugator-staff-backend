import {
  LessonAttributesInput,
  LessonAttributes,
  Lesson
} from '../models/v2/lesson.model';

export const create = async (
  payload: LessonAttributesInput
): Promise<LessonAttributes> => {
  const lesson = await Lesson.create(payload);
  return lesson.dataValues;
};

export const getById = async (id: string): Promise<LessonAttributes> => {
  const lesson = await Lesson.findByPk(id);
  return lesson ? lesson.dataValues : null;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Lesson.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: LessonAttributesInput
): Promise<LessonAttributes | undefined> => {
  const lesson = await Lesson.findByPk(id);
  if (!lesson) {
    return undefined;
  }
  const updatedLesson = await lesson.update(payload);
  return updatedLesson.dataValues;
};

export const getAll = async (): Promise<LessonAttributes[]> => {
  const lessons = await Lesson.findAll();
  return lessons.map((value) => value.dataValues);
};
