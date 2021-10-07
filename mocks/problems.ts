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
        visibility: 1
      }
    ],
    templatePackage: 'https://www.google.com',
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A'
  };
};
const createSamplePayload = (_moduleId = '53b1c579bdf3de74f76bdac9') => {
  return {
    moduleId: _moduleId,
    ...createSampleProblem()
  };
};
export { createSampleProblem, createSamplePayload };
