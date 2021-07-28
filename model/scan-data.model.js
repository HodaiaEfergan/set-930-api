const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    unitId: {type: String},
    voltage: {type: String},
    isExtVoltageOn: {type: Boolean},
    unitRSSI: {type: String},
    netCon:{type: String},
    cpuTemp:{type: String},
    snsTemp:{type: String},
    originalValue:{type: String},
    time: {type: Number, default: new Date().getTime()},

}, {timestamps: true});


const ScanData = mongoose.model('ScanData', schema);
module.exports = ScanData;

