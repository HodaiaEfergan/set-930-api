const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    color: {type: String, default: '#000000'},
    name: {type: String, default: 'no-name'},
    unitId: {type: String, default: 'def_id'},
    canSendAlerts: {type: Boolean, default: true}, // indicated if the unit can receive alerts, in order to prevent multiple alerts
    configuration: {type: mongoose.Schema.Types.ObjectId, ref: 'Configuration'},


}, {timestamps: true});


const Unit = mongoose.model('Unit', schema);
module.exports = Unit;

