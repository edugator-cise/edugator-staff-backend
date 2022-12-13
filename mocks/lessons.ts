//eslint-disable-next-line
const createSampleLesson = () => {
  return {
    title: 'Lesson 2',
    author: 'Maeloni Pompilio',
    content: [
      { type: 'text', content: { html: '<h2>Welcome to Lesson 1!<h2>' } },
      {
        type: 'MC',
        content: {
          question: 'What is the best coding langauge?',
          correctAnswer: 1,
          answers: [
            { text: 'Java', id: 0 },
            { text: 'C++', id: 1 },
            { text: 'JavaScript', id: 2 },
            { text: 'Python', id: 3 }
          ]
        }
      },
      {
        type: 'code',
        content: {
          code: 'printf("Hello World");'
        }
      },
      {
        type: 'MS',
        content: {
          question: 'What are the two best coding langauge?',
          correctAnswer: [1, 2],
          answers: [
            { text: 'Java', id: 0 },
            { text: 'C++', id: 1 },
            { text: 'JavaScript', id: 2 },
            { text: 'Python', id: 3 }
          ]
        }
      }
    ]
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createSamplePayload = (_moduleId = '53b1c579bdf3de74f76bdac9') => {
  const temp = {
    moduleId: _moduleId,
    ...createSampleLesson()
  };
  return temp;
};

export { createSamplePayload };
