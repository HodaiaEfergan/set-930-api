const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {type: String, default: '8tec'},
    units: [{type: mongoose.Schema.Types.ObjectId, ref: 'Units'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],



}, {timestamps: true});


const Company = mongoose.model('Company', schema);
module.exports = Company;

