const Unit = require('../model/unit.model');
const ScanData = require('../model/scan-data.model');
const Configuration = require('../model/configuration.model');
const lookup = require('geoip-lite');
const utils = require("../utils");


module.exports.deleteData = async (req, res) => {

    try { //test
        await Unit.remove();
        await ScanData.remove();
        res.json({success: true});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};

module.exports.getConfig = async (req, res) => {

    try {
        let uid = req.query.uid;
        let unit = await Unit.findOne({unitId: uid}).populate('configuration');
        if (!unit) {
            return res.status(404).json({success: false, message: 'unit was not found'})
        }
        res.json({success: true, data: unit.configuration});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};

module.exports.sample = async (req, res) => {


    try {
        let data = req.query.data;
        console.log(data);

        /*const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(ip);
        console.log(lookup(ip));*/

        //UBAT4220MVOLINDExt_ONURSSI21,9
        // NETCON"Partner"MCUTMPTPM40.00EXTTMPTPS31.65LOC$GPGGA,114625.715,
        // ,,,,0,00,,,M,0.0,M,,0000*50
        // $SPEEDTAGSTID43TRSSI-51,TID48TRSSI-73,TID35TRSSI-55,TID29TRSSI-56,


        // analyze scan data
        let uid = data.substring('UID'.length, data.indexOf('UBAT'));
        let voltage = data.substring(data.indexOf('UBAT') + 'UBAT'.length, data.indexOf('MV'));
        let isExtVoltageOn = data.indexOf('OLINDExt_ON') > -1;//the only option is off/on so we check if this string found or not
        let unitRSSI = data.substring(data.indexOf('URSSI') + 'URSSI'.length, data.indexOf('NETCON')).replace(/\s+/g, '');
        let netCon = data.substring(data.indexOf('NETCON') + 'NETCON'.length, data.indexOf('MCUTMPTPM')).replace("\"", '').replace("\"", '');
        let cpuTemp = data.substring(data.indexOf('MCUTMPTPM') + 'MCUTMPTPM'.length, data.indexOf('EXTTMPTPS'));
        let snsTemp = data.substring(data.indexOf('EXTTMPTPS') + 'EXTTMPTPS'.length, data.indexOf('LOC$GPGGA'));


        // find relevant unit by unit id
        let unit = await Unit.findOne({unitId: uid}).populate('configuration');
        if (!unit) {
            // this is the first sample for this unit, create new unit with unitId but without user!
            unit = await Unit.create({
                unitId: uid
            });
        }


        // create scan data object
        let newItem = await ScanData.create({
            unitId: uid,
            voltage,
            isExtVoltageOn,
            unitRSSI,
            netCon,
            cpuTemp,
            snsTemp,
            originalValue: data,
            time: new Date().getTime()
        });


        // handle alerts
        await handleConfiguration(unit.toObject(), newItem.toObject());
        await alertSmsMail(unit.toObject(), newItem.toObject());
        res.json({success: true, data: newItem});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};
async function alertSmsMail(unit, scanData){
    let config = unit.configuration;
    // cpu temp- we want alert when its bigger than the max or less than the min
    if (config.cpuTemp.enabled) {
        //if (!config.sendAlertsFromServer.enabled) return;
        if (config.sendAlertsFromServer.enabled) {
            //אם זה בין לבין זה בסדר!
            if (scanData.cpuTemp > config.cpuTemp.max || scanData.cpuTemp < config.cpuTemp.min) {
                if (config.alertMethods.email.enabled) {
                    console.log("111111");
                    await utils.sendEmail(config.alertMethods.email.email, "your voltage battery is low");
                    return;
                }
                if (config.alertMethods.sms.enabled) {
                    console.log("111111");

                    await utils.sendSMS(config.alertMethods.sms.number, "your voltage battery is low");
                    return;
                }

            }
        }
    }
    if (config.cpuTemp.enabled) {
        if (!config.sendAlertsFromServer) return;
        if (config.sendAlertsFromServer.enabled) {
            if (config.alertMethods.email.enabled) {
                if (scanData.cpuTemp < config.max.value && scanData.cpuTemp < config.min.value) {
                    console.log("123123");
                    await utils.sendSMS(config.alertMethods.sms.phone, "ask hezi what to send!");
                    //sendAlert(unit, `cpuTemp level is too low (${scanData.cpuTemp}V)`);
                    //sendEmail("lowBat", `cpuTemp level is too low (${scanData.voltage}V)`, this.config.alertMethods.email.email)
                    return;
                }
            }
        }
    }
    await Unit.findByIdAndUpdate(unit._id, {canSendAlerts: true});

}

async function handleConfiguration(unit, scanData) {

    if (!unit.configuration) return;


    // load configuration from server
    let config = unit.configuration;
    if (!config.enabled) return;
    if (!config.alertMethods.sms.enabled && !config.alertMethods.email.enabled) return;

    // check cpu temp



    todo

    // sample is good, no alerts, update can send alerts to true
    await Unit.findByIdAndUpdate(unit._id, {canSendAlerts: true});


}

//
// async function sendAlert(unit, message) {
//     if (!unit.canSendAlerts) return; // alert already sent not long ago
//
//     // check if server needs to send alerts at all
//     if (!unit.configuration.sendAlertsFromServer) {
//         return;
//     }
//
//
//     // check if can send email
//     if (unit.configuration.alertMethods.email.enabled) {
//         // now we can sent the email
//         const email = unit.configuration.alertMethods.email.email;
//         //utils.sendEmail(`message from unit ${unit.unitId}`, message, email);
//     }
//
//     // check if can send sms
//     if (unit.configuration.alertMethods.sms.enabled) {
//         // now we can sent the sms
//         const number = unit.configuration.alertMethods.sms.number;
//         //utils.sendSMS(`message from unit ${unit.unitId}`, message, number);
//     }
//
//
//     await Unit.findByIdAndUpdate(unit._id, {canSendAlerts: false});
//
//     console.log('sending alert', message);
// }

module.exports.relateUnits = async (req, res) => {
    try {
        const units = req.body.units;
        const configId = req.body.configId;
        if (!units || !configId) {
            return res.status(400).json({success: false, message: 'please enter valid data'});
        }

        const selectedIds = units.filter(u => u.selected).map(u => u._id);
        const removedIds = units.filter(u => !u.selected).map(u => u._id);

        let updateRes = await Unit.updateMany({_id: {$in: selectedIds}}, {configuration: configId});
        if (removedIds.length > 0) updateRes = await Unit.updateMany({_id: {$in: removedIds}}, {configuration: null});
        res.json({success: true});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};

