import mongoose, { Schema } from 'mongoose';

const problemModel = new Schema(
  {
    problemType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    hidden: {
      type: Boolean,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    code: {
      header: {
        type: String,
        required: true
      },
      body: {
        type: String,
        required: true
      },
      footer: {
        type: String,
        required: true
      }
    },
    fileExtension: {
      type: String,
      required: true,
      enum: ['.java', '.cpp', '.h'] //I don't know what else could go in here? Maybe ".cxx"?
    },
    testCases: [
      {
        input: {
          type: String,
          required: true
        },
        expectedOutput: {
          type: String,
          required: true
        },
        hint: {
          type: String,
          required: true
        },
        // visibility: 0, 1, or 2
        visibility: {
          type: Number,
          required: true,
          enum: [0, 1, 2]
        },
        templatePackage: {
          type: String,
          required: true
        }
      }
    ],
    timeLimit: {
      // Still figuring thhis one out: thinking msec
      type: Number,
      required: true
    },
    memoryLimit: {
      // data in MB?
      type: Number,
      required: true
    },
    buildCommand: {
      type: String,
      required: true
    }
  },
  { collection: '_problem' }
);

export default mongoose.model('problemModel', problemModel);
