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
    ref: '_problem',
    required: true
  }
},
{collection: 'modules'}
);

const Module = model<ModuleInterface>('This module parameter does NOT matter', moduleSchema);

export default Module;
