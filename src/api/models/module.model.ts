import mongoose, { Schema } from 'mongoose';

interface Module {
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
    required: true
  }
});

const ModuleModel = mongoose.model<Module>('moduleModel', moduleSchema);

export default ModuleModel;
