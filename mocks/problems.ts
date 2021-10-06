//eslint-disable-next-line
const createSampleProblem = () => {
  return {
    statement: 'sample problem statement',
    title: 'new title',
    hidden: false,
    language: 'C++',
    dueDate: '2011-10-05T14:48:00.000Z',
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
    templatePackage: 'string package',
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A'
  };
};
const createSamplePayload = () => {
  return {
    moduleId: '123456',
    ...createSampleProblem()
  };
};
export { createSampleProblem, createSamplePayload };
