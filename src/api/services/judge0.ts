import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { judgeURI } from '../../config/vars';

interface SubmissionPayload {
  language_id: number;
  source_code: string;
  stdin: string;
  cpu_time_limit: number; // seconds
  memory_limit: number;
  compiler_options: string;
}
class JudgeServer {
  url: string;
  axiosInstance: AxiosInstance;
  constructor(url: string) {
    this.url = url;
    this.axiosInstance = axios.create({
      baseURL: url,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        useQueryString: true
      }
    });
  }

  createSubmission(
    submissionPayload: SubmissionPayload,
    base64: boolean
  ): Promise<AxiosResponse> {
    return this.axiosInstance.post(
      `/submissions/?base64_encoded=${base64}`,
      submissionPayload
    );
  }

  deleteSubmission(
    submissionId: string,
    base64: boolean
  ): Promise<AxiosResponse> {
    const config = {
      headers: {
        'X-Auth-User': process.env.EDUGATOR_AUTH_TOKEN
      }
    };
    return this.axiosInstance.delete(
      `/submissions/${submissionId}?base64_encoded=${base64}`,
      config
    );
  }
  getSubmission(token: string, base64: boolean): Promise<AxiosResponse> {
    return this.axiosInstance.get(
      `/submissions/${token}?base64_encoded=${base64}`
    );
  }
  // Used for polling function to define payload as one argument instead of a variable amount
  getSubmissionVariant({ token, base64 }): Promise<AxiosResponse> {
    return this.axiosInstance.get(
      `/submissions/${token}?base64_encoded=${base64}`
    );
  }
}

const judgeEngine = new JudgeServer(judgeURI);

export { judgeEngine, JudgeServer, SubmissionPayload };
