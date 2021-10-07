import { model, Document, Schema, Types } from 'mongoose';

interface ModuleInterface {
  name: string;
  number: number;
  problems: [Types.ObjectId];
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
      required: true
    },
    problems: {
      type: [Schema.Types.ObjectId],
      ref: '_problem',
      required: true
    }
  },
  { collection: 'modules' }
);

const Module = model<ModuleInterface>('modules', moduleSchema);

export { Module, ModuleDocument };
