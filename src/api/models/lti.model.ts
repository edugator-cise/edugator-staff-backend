import { model, Schema, Document } from 'mongoose';

interface User {
  given_name: string;
  family_name: string;
  user_id: string;
  email: string;
  status: string;
  roles: Array<string>;
}

interface Assignment {
  lineItem: string;
  problemId: string;
  maxPoints: string;
}

interface Course {
  course_url: string;
  members: Array<User>;
  assignments: Array<Assignment>;
}

const ltiSchema = new Schema<Course>(
  {
    course_url: {
      type: String,
      required: true
    },
    members: {
      type: [
        {
          given_name: {
            type: String,
            required: true
          },
          family_name: {
            type: String,
            required: true
          },
          user_id: {
            type: String,
            required: true
          },
          email: {
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
      required: true
    },
    assignments: {
      type: [
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
      ],
      required: false
    }
  },
  { collection: 'ltiData' }
);

interface LtiCourseDocument extends Course, Document {}

const LtiCourseModel = model('ltiData', ltiSchema);

export { LtiCourseModel, LtiCourseDocument };
