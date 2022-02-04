import { ProblemInterface } from "../api/models/problem.model";
import pool from "pool";

// Example file, remove TODO

problemColumns: string[] = [
    "name",
    "string",
    . . .
];

function insertProblem(problem: Problem) {
    res: any[] = pool.query(
        `
        INSERT INTO Problem
        (name, statement, . . .)
        VALUES
        (   
          /1,
          /2,   
        )
        `
    );
}

function updateProblem(problem: Problem) {
    // code
}

function deleteProblem(problem: Problem) {
    // code
}

function main() {
    problems: Problem[] = mongoose.problem.fetchall(); // read from mongo
    problems.foreach((problem: Problem) => insertProblem(problem));
}