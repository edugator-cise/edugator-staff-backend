// is annotating with ? the best way to allow nulls?
// is it best to omit the id from here?
interface mySQLModule {
  id: number;
  name: string;
  number: number;
}

// is it best to omit the id from here?
interface mySQLProblem {
  id: number;
  statement: string;
  title: string;
  hidden: boolean;
  language: string;
  due_date: string; // is this fine for DATETIME in SQL?
  file_extension: string;
  template_package: string;
  time_limit?: number;
  memory_limit?: number;
  build_command?: string;
  module_id: number;
}

// is it best to omit the id from here?
interface mySQLCode {
  id: number;
  header?: string;
  body?: string;
  footer?: string;
  problem_id: number;
}

// is it best to omit the id from here?
interface mySQLTestCase {
  id: number;
  input: string;
  expected_output: string;
  hint: string;
  visibility: number;
  problem_id: number;
}

export { mySQLModule, mySQLProblem, mySQLCode, mySQLTestCase };
