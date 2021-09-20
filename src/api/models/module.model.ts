import mongoose, { Schema } from 'mongoose';

interface ModuleInterface {
  name: string;
  number: number;
  problems: [mongoose.Types.ObjectId];
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
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Problem',
    required: true
  }
});

const Module = mongoose.model<ModuleInterface>('moduleModel', moduleSchema);

export default Module;
