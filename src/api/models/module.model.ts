import { model, Schema, Types } from 'mongoose';

interface ModuleInterface {
  name: string;
  number: number;
  problems: [Types.ObjectId];
}

const moduleSchema = new Schema({
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
    ref: 'Problem',
    required: true
  }
});

const Module = model<ModuleInterface>('module', moduleSchema);

export default Module;
