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
  lang_config: {
    language: string;
    code: {
      header: string;
      body: string;
      footer: string;
    };
    fileExtension: string; //Interface doesn't enforce enum
    testCases: TestCase[];
    timeLimit: number; // in seconds
    memoryLimit: number; // in KB
    buildCommand: string;
  }[];
  dueDate: Date;
  templatePackage: string;
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
    lang_config: [
      {
        language: {
          type: String,
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
          enum: ['.py', '.cpp', '.h', '.java'] //I don't know what else could go in here? Maybe ".cxx"?
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
        timeLimit: {
          type: Number
        },
        memoryLimit: {
          type: Number
        },
        buildCommand: {
          type: String
        }
      }
    ],
    dueDate: {
      type: Date,
      required: true
    },
    templatePackage: {
      type: String,
      required: true
    }
  },
  //This is the name of the collection
  { collection: '_problem' }
);

// the first argument does not name the collection
const Problem = model<ProblemInterface>('_problem', problemSchema);

export { Problem, ProblemDocument, ProblemInterface, TestCase };
