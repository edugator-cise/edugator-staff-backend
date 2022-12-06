import * as express from 'express';
import * as submissionsController from '../../controllers/submission.controller';
import multer from '../../middlewares/multer';
import { authenticateJWT } from '../../middlewares/auth';
const submissionRouter = express.Router();

submissionRouter
  .route('/upload')
  .post(
    [authenticateJWT, multer.single('submission_file')],
    submissionsController.processAndTestSubmissions
  );

export { submissionRouter };