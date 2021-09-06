// const mongoose = require('mongoose');
import mongoose, { Schema } from "mongoose";

const moduleModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    Problem: [
        {
            //[ObjectID1, ObjectID2...]
            objectID: {
                type: String,
                required: true,
            }
        },
    ],
});

export default mongoose.model('moduleModel', moduleModel);