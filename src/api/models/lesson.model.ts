import { model, Document, Schema } from 'mongoose';

// content blocks for each content type
interface TextContent {
  html: string;
}
interface MultipleChoiceContent {
  question: string;
  image?: boolean;
  sourcePath?: string;
  correctAnswer: number;
  answers: Answer[];
}
interface MultipleSelectContent {
  question: string;
  correctAnswer: number[];
  answers: Answer[];
}
interface CodeContent {
  code: string;
}
interface ImageContent {
  html: string;
  sourcePath: string;
  title: string;
  caption: string;
  size: string;
  alignment: string;
}
interface Answer {
  text: string;
  id: 0;
}

interface ContentBlock {
  type: 'text' | 'MC' | 'MS' | 'code' | 'image';
  content:
    | TextContent
    | MultipleChoiceContent
    | MultipleSelectContent
    | CodeContent
    | ImageContent;
}

interface Block {
  data: any;
  type: string;
  depth: number;
  entityRanges: any[];
  inlineStyleRanges: any[];
  text: string;
  key: string;
}

interface EditorState {
  blocks: Block[];
  entityMap: any;
}

interface LessonInterface {
  title: string;
  author: string;
  createDate: Date;
  updateDate: Date;
  editableContent: EditorState;
  blocks: Block[];
  entityMap: any;
  content: ContentBlock[];
}

interface LessonDocument extends LessonInterface, Document {}

const lessonSchema = new Schema<LessonInterface>(
  {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    createDate: {
      type: Date,
      required: false
    },
    updateDate: {
      type: Date,
      required: false
    },
    editableContent: {
      blocks: [
        {
          data: {
            type: Object,
            required: true
          },
          type: {
            type: String,
            required: true
          },
          depth: {
            type: Number,
            required: true
          },
          entityRanges: {
            type: Object,
            required: true
          },
          inlineStyleRanges: {
            type: Object,
            required: true
          },
          text: {
            type: String,
            required: true
          },
          key: {
            type: String,
            required: true
          }
        }
      ],
      entityMap: {
        type: Object,
        required: false
      }
    },
    blocks: [
      {
        data: {
          type: Object,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        depth: {
          type: Number,
          required: true
        },
        entityRanges: {
          type: Object,
          required: true
        },
        inlineStyleRanges: {
          type: Object,
          required: true
        },
        text: {
          type: String,
          required: true
        },
        key: {
          type: String,
          required: true
        }
      }
    ],
    // define entity map with keys as numbers and values as objects
    entityMap: [
      {
        data: {
          type: Object,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        mutability: {
          type: String,
          required: true
        }
      }
    ],
    content: [
      {
        type: {
          type: String,
          required: true
        },
        content: {
          type: Object,
          required: true
        }
      }
    ]
  },
  //This is the name of the collection
  { collection: '_lesson' }
);

// the first argument does not name the collection
const Lesson = model<LessonInterface>('_lesson', lessonSchema);

export { Lesson, LessonDocument, LessonInterface };
