import { createSamplePayloadMySql } from './problems';

//eslint-disable-next-line
const createSampleModule = () => {
  return {
    name: 'Stacks/Lists/Queues',
    number: 5.1
  };
};

const createSampleModulePayloadMySql = (_moduleId = 1) => {
  const temp = {
    id: _moduleId,
    ...createSampleModule(),
    problems: [createSamplePayloadMySql()]
  };
  return temp;
};

export { createSampleModule, createSampleModulePayloadMySql };
