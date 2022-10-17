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

interface LessonInterface {
  title: string;
  author: string;
  createDate: Date;
  updateDate: Date;
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
