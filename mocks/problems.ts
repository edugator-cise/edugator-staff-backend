//eslint-disable-next-line
const createSampleProblem = () => {
  return {
    problemType: 'hi',
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
        visibility: 1,
        templatePackage: 'www.google.com'
      }
    ],
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A'
  };
};

export { createSampleProblem };
