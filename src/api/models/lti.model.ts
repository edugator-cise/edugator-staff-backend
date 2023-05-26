import { model, Schema, Document } from 'mongoose';

interface User {
  firstName: string;
  lastName: string;
  userId: string;
  status: string;
  roles: Array<string>;
}

interface Assignment {
  lineItem: string;
  problemId: string;
  maxPoints: string;
}

interface Course {
  canvas_url: string;
  members: Array<User>;
  assignments: Array<Assignment>;
}

const ltiSchema = new Schema<Course>(
  {
    canvas_url: {
      type: String,
      required: true
    },
    members: [
      {
        firstName: {
          type: String,
          required: true
        },
        lastName: {
          type: String,
          required: true
        },
        userId: {
          type: String,
          required: true
        },
        status: {
          type: String,
          required: false
        },
        roles: [
          {
            type: String,
            required: true
          }
        ]
      }
    ],
    assignments: [
      {
        lineItem: {
          type: String,
          required: true
        },
        problemId: {
          type: String,
          required: true
        },
        maxPoints: {
          type: String,
          required: true
        }
      }
    ]
  },
  { collection: 'ltiData' }
);

interface CourseDocument extends Course, Document {}

const LtiModel = model('ltiData', ltiSchema);

export { LtiModel, CourseDocument };
