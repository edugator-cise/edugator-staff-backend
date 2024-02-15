# Edugator Backend

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

## Project Description

`edugator-staff-backend` serves as the backend infrastructure for Edugator, a pioneering platform designed for students enrolled in the Data Structures and Algorithms course at the University of Florida. This backend seamlessly integrates with various external services, such as Judge0 for execution of code, ltijs for connecting with LMSs such as Canvas, and Clerk for authentication. 

This backend contains multiple versions of routes (e.g. v1, v2, ...). v1 routes are mostly deprecated, and use the old MongoDB database. v2 routes and onwards are using the NodeJS `sequelize` library as the ORM, which interfaces with a MySQL database. Some of the `v2` routes, and all of the `v3` routes are protected by Clerk authentication, meaning that they will require a valid Clerk token in the header, with the correct permissions, in order to access the routers. 
Ensure that, when you receive the `.env` file from the administrators, it has credentials for both databases to ensure both the `v1` and `v2` routes are working.

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
   
You need to source the `.env` file first before you can run the server. Assuming that you placed it in the root directory, you can run this in the project root:
```
source .env
```

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
Make sure that the `.env` file is configured to run in production mode by setting the `NODE_ENV` variable to `production` instead of `development` which it is defaulted to. This ensures that it will make the correct database connection.

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
