import mongoose, { Schema } from 'mongoose';

interface Module {
  name: string;
  number: number;
}

const moduleSchema = new Schema<Module>({
  name: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  }
});

const ModuleModel = mongoose.model<Module>('moduleModel', moduleSchema);

export default ModuleModel;
