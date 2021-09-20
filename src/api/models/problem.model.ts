import { model, Schema } from 'mongoose';

interface ProblemInterface {
  problemType: string;
  title: string;
  hidden: boolean;
  language: string;
  dueDate: Date;
  code: {
    header: string;
    body: string;
    footer: string;
  };
  fileExtension: string; //Interface doesn't enforce enum
  testCases: [
    {
      input: string;
      expectedOutput: string;
      hint: string;
      visibility: number; // doesn't enforce visibility: 0, 1, or 2
      templatePackage: string;
    }
  ];
  timeLimit: number;
  memoryLimit: number;
  buildCommand: string;
}

const problemSchema = new Schema<ProblemInterface>(
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
      type: Number,
      required: true
    },
    memoryLimit: {
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

const Problem = model('problemModel', problemSchema);

export default Problem;
