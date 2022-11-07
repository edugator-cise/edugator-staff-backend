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
      }
    ]
  };
};

const createSamplePayload = (_moduleId = '53b1c579bdf3de74f76bdac9') => {
  const temp = {
    moduleId: _moduleId,
    ...createSampleLesson()
  };
  return temp;
};

export { createSamplePayload };
