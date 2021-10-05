import { model, Schema, Types, PopulatedDoc } from 'mongoose';
import { ProblemInterface } from './problem.model';

interface ModuleInterface {
  name: string;
  number: number;
  problems: PopulatedDoc<Types.ObjectId & ProblemInterface>[];
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

const Module = model<ModuleInterface>('modules', moduleSchema);

export default Module;
export { ModuleInterface };
