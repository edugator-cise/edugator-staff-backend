# Edugator-staff-backend

<br />

<p align="center">
  <img alt="GitHub" src="https://img.shields.io/badge/License-GPLv3-blue.svg">
</p>

# Documentation

Formal documentation and contributing for this api can be found [here](https://github.com/edugator-cise/edugator-staff-backend/wiki)

# File Structure

```
├── src/
│   ├── config/
│   ├── index.ts
│   └── api/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       └── validation/
├── package.json
├── __tests__/
└── ...
```

- `__tests__/` : hold all jest unit test cases for each route file
- `routes/`: holds all route files that dictate url api e.g api/v1/module will call routes/module.routes.ts
- `controllers/`: holds all functions that are called for a specific http verb for each route
- `middlewares/`: contains functions that are called before a client accesses the route's function e.g auth
- `services/`: third party resources the api uses
- `validation/`: used to validate input from the client to ensure strict equality
- `package.json`: holds dependencies and scripts
- `index.ts`: main file where server starts

# Prerequisites

- Have npm 6.14.x installed
- node version 14.x installed
- .env file from administrators

# Getting Started

1. Clone the Project

```
git clone https://github.com/edugator-cise/edugator-staff-backend.git
```

2. Copy path of env file to root directory of project

```
cp /path/to/env/.env /path/to/project
```

3. install packages

```
npm install
```

4. run development server on port 8080

```
npm run dev
```

## Run tests

```
npm run test
```

## Run CI check

```
npm run checklist
```

## Legal Information

&copy; Copyright 2021 University of Florida Research Foundation, Inc. All Commercial Rights Reserved.
