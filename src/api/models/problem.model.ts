import { model, Document, Schema } from 'mongoose';

interface TestCase {
  input: string;
  expectedOutput: string;
  hint: string;
  visibility: number; // doesn't enforce visibility: 0, 1, or 2
}
interface ProblemInterface {
  statement: string;
  title: string;
  hidden: boolean;
  fileName: string;
  language: string;
  dueDate: Date;
  author: string;
  difficulty: string;
  dateCreated: Date;
  lastModified: Date;
  isShort: boolean;
  hasTemplate: boolean;
  isQuiz: boolean;
  code: {
    header: string;
    body: string;
    footer: string;
  };
  fileExtension: string; //Interface doesn't enforce enum
  testCases: TestCase[];
  templatePackage: string;
  timeLimit: number; // in seconds
  memoryLimit: number; // in KB
  buildCommand: string;
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
<<<<<<< HEAD
    author: {
      type: String,
      required: false
    },
    difficulty: {
      type: String,
      required: false
    },
    dateCreated: {
      type: Date,
      required: false
    },
    lastModified: {
      type: Date,
      required: false
    },
    isShort: {
      type: Boolean,
      required: false
    },
    hasTemplate: {
      type: Boolean,
      required: false
    },
    isQuiz: {
      type: Boolean,
      required: false
    },
=======
    fileName: {
      type: String,
      required: false
    },
>>>>>>> 536f41a72960b24aae4b79518d00da1f5bca1899
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
    testCases: [
      {
        input: {
          type: String,
          required: true
        },
        expectedOutput: {
          type: String
        },
        hint: {
          type: String
        },
        // visibility: 0, 1, or 2
        visibility: {
          type: Number,
          required: true,
          enum: [0, 1, 2]
        }
      }
    ],
    templatePackage: {
      type: String,
      required: true
    },
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

export { Problem, ProblemDocument, ProblemInterface, TestCase };
