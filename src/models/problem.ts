// const mongoose = require('mongoose');
import mongoose, { Schema } from "mongoose";

const problemModel = new Schema({
    problemType: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    hidden: {
        type: Boolean,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    code: {
        header: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        footer: {
            type: String,
            required: true,
        },
    },
    fileExtension: {
        type: Enumerator,
        required: true,
    },
    testCases: [
        {
            input: {
                type: String,
                required: true,
            },
            expectedOutput: {
                type: String,
                required: true,
            },
            hint: {
                type: String,
                required: true,
            },
            // visibility: 0, 1, or 2
            visibility: {
                type: Number,
                required: true,
                min: 0,
                max: 2,
            }
            /*templatePackage: {
                type: TBDDDDDD
                required: true?
            }*/
        },
    ],
    timeLimit: {
        // Still figuring thhis one out: thinking msec
        type: Number,
        required: true,
    },
    memoryLimit: {
        // data in MB?
        type: Number,
        required: true,
    },
    buildCommand: {
        type: String,
        required: true,
    },
});

export default mongoose.model('problemModel', problemModel);