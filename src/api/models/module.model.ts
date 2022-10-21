import { model, Document, Schema, Types } from 'mongoose';

interface ModuleInterface {
  name: string;
  number: number;
  problems: [Types.ObjectId];
  lessons: [Types.ObjectId];
}

interface ModuleDocument extends ModuleInterface, Document {}

const moduleSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true,
      set: setNumber
    },
    problems: {
      type: [Schema.Types.ObjectId],
      ref: '_problem',
      required: true
    },
    lessons: {
      type: [Schema.Types.ObjectId],
      ref: '_lesson',
      required: true
    }
  },
  { collection: 'modules' }
);

interface ModuleDocument extends ModuleInterface, Document {}

const Module = model<ModuleInterface>('modules', moduleSchema);

function setNumber(num) {
  return num.toFixed(1);
}

export { Module, ModuleDocument, ModuleInterface };
