import mongoose, { Schema } from 'mongoose';

const moduleModel = new Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  problem: [mongoose.Schema.Types.ObjectId]
});

export default mongoose.model('moduleModel', moduleModel);
