const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    role: {type: String, enum: ['user', 'manager', 'owner'], default: 'user'},
    email: {type: String, unique: [true, 'email already exists'], required: true},
    name: {type: String,default: ''},
    password: {type: String, required: true},
    isLocked: {type: Boolean, default: false},
    isHaveManager: {
        type: {
            enabled: {type: Boolean, default: false},
            name: {type: String, default: ''},
        }
    },
    forgotPasswordToken: {type: String, default: ''},
    myUnits:{type:String,default:''},


}, {timestamps: true});

// test commit

const User = mongoose.model('User', schema);
module.exports = User;
