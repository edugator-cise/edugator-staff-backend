//eslint-disable-next-line
const createSampleProblem = () => {
  return {
    statement: 'sample problem statement',
    title: 'new title',
    hidden: false,
    language: 'C++',
    dueDate: '2011-10-05',
    code: {
      header: '#include <iostream>',
      body: 'int main()',
      footer: '  '
    },
    fileExtension: '.cpp',
    testCases: [
      {
        input: '123',
        expectedOutput: '12345',
        hint: 'n/a',
        visibility: 2
      }
    ],
    templatePackage: 'https://www.google.com',
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A'
  };
};

const createSampleProblemMySql = () => {
  return {
    statement: 'sample problem statement',
    title: 'new title',
    hidden: false,
    language: 'C++',
    dueDate: new Date('2011-10-05T20:00:00.000Z'),
    code: {
      header: '#include <iostream>',
      body: 'int main()',
      footer: '  ',
      problemId: 1
    },
    fileExtension: '.cpp',
    testCases: [
      {
        input: '123',
        expectedOutput: '12345',
        hint: 'n/a',
        visibility: 2,
        problemId: 1
      }
    ],
    templatePackage: 'https://www.google.com',
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A'
  };
};

const createSamplePayload = (_moduleId = '53b1c579bdf3de74f76bdac9') => {
  const temp = {
    moduleId: _moduleId,
    ...createSampleProblem()
  };
  return temp;
};

const createSamplePayloadMySql = (_moduleId = 1) => {
  const temp = {
    moduleId: _moduleId,
    ...createSampleProblemMySql()
  };
  return temp;
};

const addOrEditField = (samplePayload, field, value) => {
  samplePayload[field] = value;
  return { ...samplePayload };
};
export {
  createSampleProblem,
  createSamplePayload,
  createSamplePayloadMySql,
  addOrEditField
};
