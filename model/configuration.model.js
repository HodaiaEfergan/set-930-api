const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {type: String, required: true},
    sms: {type: Boolean, default: false},
    call: {type: Boolean, default: false},
    email: {type: Boolean, default: false},
    enabled: {type: Boolean, default: true},

    cpuTemp: {
        type: {
            enabled: {type: Boolean, default: true},
            min: {type: Number, default: 0},
            max: {type: Number, default: 0},
        }
    },
    smsTemp: {
        type: {
            enabled: {type: Boolean, default: true},
            min: {type: Number, default: 20},
            max: {type: Number, default: 30},
        }
    },

    lowBat: {
        type: {
            enabled: {type: Boolean, default: true},
            value: {type: Number, default: 20},
        }
    },
    wifiConnection: {
        type:{
            enabled: {type: Boolean, default: true},
            name: {type:String , default: ''},
            password: {type:String , default: ''}

        }
    },

    alertMethods: {
        type: {
            sms: {
                type: {
                    enabled: {type: Boolean, default: false},
                    number: {type: String, default: ''},
                }
            },
            email: {
                type: {
                    enabled: {type: Boolean, default: false},
                    email: {type: String, default: ''},
                }
            },//k;
            sendAlertsFromServer: {type: Boolean, default: true},
            sendAlertsFromUnit: {type: Boolean, default: true},

        }
    }
}, {timestamps: true});


const Configuration = mongoose.model('Configuration', schema);
module.exports = Configuration;


// CRUD = Create Read Update delete
