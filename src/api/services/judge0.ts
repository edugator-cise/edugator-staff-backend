import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { judgeURI } from '../../config/vars';

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
    code: string,
    language: number,
    base64: boolean,
    cArgs: string
  ): Promise<AxiosResponse> {
    const payload = {
      language_id: language,
      source_code: code,
      stdin: cArgs
    };
    return this.axiosInstance.post(
      `/submissions/?base64_encoded=${base64}`,
      payload
    );
  }
  getSubmission(token: string, base64: boolean): Promise<AxiosResponse> {
    return this.axiosInstance.get(
      `/submissions/${token}?base64_encoded=${base64}`
    );
  }
  getSubmissionVariant({ token, base64 }): Promise<AxiosResponse> {
    return this.axiosInstance.get(
      `/submissions/${token}?base64_encoded=${base64}`
    );
  }
}

const judgeEngine = new JudgeServer(judgeURI);

export { judgeEngine, JudgeServer };
