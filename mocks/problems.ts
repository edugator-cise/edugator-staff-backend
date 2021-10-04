//eslint-disable-next-line
const createSampleProblem = () => {
  return {
    problemType: 'hi',
    title: 'new title',
    hidden: false,
    templatePackage: 'www.google.com',
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
    timeLimit: 1000,
    memoryLimit: 10000,
    buildCommand: 'N/A',
    moduleName: 'Stacks/Lists/Queues'
  };
};

export { createSampleProblem };
