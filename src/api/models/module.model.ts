import { model, Schema, Types, Document } from 'mongoose';

interface ModuleInterface {
  name: string;
  number: number;
  problems: [Types.ObjectId];
}

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

interface ModuleDocument extends ModuleInterface, Document {}

const Module = model<ModuleInterface>('modules', moduleSchema);

export { Module, ModuleDocument };
