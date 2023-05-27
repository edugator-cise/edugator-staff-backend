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
  assignmentName: string;
  scoreMaximum: string;
  grades: [
    {
      email: string;
      score: number;
    }
  ];
}

interface Course {
  course_url: string;
  members: Array<User>;
}

const ltiCourseSchema = new Schema<Course>(
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
    }
  },
  { collection: 'ltiCourses' }
);

const ltiAssignmentSchema = new Schema<Assignment>(
  {
    lineItem: {
      type: String,
      required: true
    },
    problemId: {
      type: String,
      required: true
    },
    assignmentName: {
      type: String,
      required: true
    },
    scoreMaximum: {
      type: String,
      required: true
    },
    grades: {
      type: [
        {
          email: {
            type: String,
            required: true
          },
          score: {
            type: Number,
            required: true
          }
        }
      ],
      required: false
    }
  },
  { collection: 'ltiAssignments' }
);

interface LtiCourseDocument extends Course, Document {}
interface LtiAssignmentDocument extends Assignment, Document {}

const LtiCourseModel = model('ltiCourses', ltiCourseSchema);
const LtiAssignmentModel = model('ltiAssignments', ltiAssignmentSchema);

export {
  LtiCourseModel,
  LtiCourseDocument,
  LtiAssignmentModel,
  LtiAssignmentDocument
};
