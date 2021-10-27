import { model, Document, Schema } from 'mongoose';

interface ProblemInterface {
  statement: string;
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
    }
  ];
  templatePackage: string;
  timeLimit: number;
  memoryLimit: number;
  buildCommand: string;
  moduleId?: string;
}

interface ProblemDocument extends ProblemInterface, Document {}

const problemSchema = new Schema<ProblemInterface>(
  {
    statement: {
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
        type: String
      },
      body: {
        type: String
      },
      footer: {
        type: String
      }
    },
    fileExtension: {
      type: String,
      required: true,
      enum: ['.java', '.cpp', '.h'] //I don't know what else could go in here? Maybe ".cxx"?
    },
    templatePackage: {
      type: String,
      required: true
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
        }
      }
    ],
    timeLimit: {
      type: Number
    },
    memoryLimit: {
      type: Number
    },
    buildCommand: {
      type: String
    }
  },
  //This is the name of the collection
  { collection: '_problem' }
);

// the first argument does not name the collection
const Problem = model<ProblemInterface>('_problem', problemSchema);

export { Problem, ProblemDocument, ProblemInterface };
