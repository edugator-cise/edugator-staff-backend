# Edugator Backend

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

## Project Description

`edugator-staff-backend` serves as the backend infrastructure for Edugator, a pioneering platform designed for students enrolled in the Data Structures and Algorithms course at the University of Florida. This backend seamlessly integrates with various external services, such as Judge0 for execution of code, ltijs for connecting with LMSs such as Canvas, and Clerk for authentication.

## Documentation / Contributing
Formal documentation and contributing for this api can be found [here](https://github.com/edugator-cise/edugator-staff-backend/wiki)

## Repository Structure

```
├── src/
│   ├── index.ts
│   ├── config/
|   |    ├── express.ts
│   └── api/
|       ├── v1/
│       |   ├── controllers/
│       |   ├── middlewares/
│       |   ├── routes/
│       |   ├── services/
│       |   └── validation/
|       ├── v2/
│           ├── controllers/
│           ├── middlewares/
│           ├── routes/
│           ├── services/
│           └── validation/
├── package.json
├── __tests__/
└── ...
```

- `controllers/`: holds all functions that are called for a specific http verb for each route
- `middlewares/`: contains functions that are called before a client accesses the route's function e.g auth
- `routes/`: holds all route files that dictate url api e.g a request to `api/v1/module` will call `routes/module.routes.ts`
- `services/`: third party resources the api uses, such as Clerk and Judge0
- `validation/`: used to validate input from the client to ensure strict equality
- `package.json`: holds dependencies and scripts
- `index.ts`: entrypoint for server setup, runs the express server setup in `config/express.ts`
- - `__tests__/` : hold all jest unit test cases for each route file


## Prerequisites
- NPM v6.14.x
- Node v20.0.0
- .env file with AWS and database credentials (request from administrators and place in root directory of project)

## Getting Started

1. Clone the Project

```
git clone https://github.com/edugator-cise/edugator-staff-backend.git
cd edugator-staff-backend
```

2. Install packages

```
npm install
```

3. Run server
For a development environment, you can use this command to run the server on port 8080:
```
npm run dev
```

For a production environment, you can instead choose to build the project for a more optimized runtime. You can do this with:
```
npm run build
```
After it builds, you can run the server by executing the compiled JavaScript entrypoint found in `build/src/index.js`
```
node build/src/index.js
```

## Testing

To execute the test to ensure functionality is working and the credentials are correct, run:
```
npm run test
```

## CI Check

To run the CI check, run:
```
npm run checklist
```

## Credits
- **Team Name**: Edugator
- **Team Members**: Prayuj Tuli, Marc Diaz, Dustin Karp, Amanpreet Kapoor

## Legal Information
&copy; Copyright 2021 University of Florida Research Foundation, Inc. All Commercial Rights Reserved.
