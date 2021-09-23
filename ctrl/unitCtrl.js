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


        //utils.sendSMS("0524289665" , "your voltage battery is low");
        await handleConfiguration(unit.toObject(), newItem.toObject());
        res.json({success: true, data: newItem});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};


async function handleConfiguration(unit, scanData) {

    if (!unit.configuration) return;


    // load configuration from server
    let config = unit.configuration;
    if (!config.enabled) return;
    if (!config.alertMethods.sms.enabled && !config.alertMethods.email.enabled) return;

    // check cpu temp - config.alertMethods.email.email


    // cpu temp- we want alert when its bigger than the max or less than the min
    if (config.cpuTemp.enabled) {
        if (!config.sendAlertsFromServer) return;
        if (config.sendAlertsFromServer) {
            //אם זה בין לבין זה בסדר!
            if (scanData.cpuTemp > config.cpuTemp.max || scanData.cpuTemp < config.cpuTemp.min) {
                if (config.alertMethods.email.enabled) {
                    console.log("111111");
                    await utils.sendEmail(config.alertMethods.email.email, "cpu temp");
                    return;
                }
                if (config.alertMethods.sms.enabled) {
                    console.log("111111");

                    await utils.sendSMS(config.alertMethods.sms.number, "cpu temp");
                    return;
                }

            }
        }
    }
    if (config.snsTemp.enabled) {
        if (!config.sendAlertsFromServer.enabled) return;
        if (config.sendAlertsFromServer.enabled) {
            if (config.alertMethods.email.enabled) {
                if (scanData.snsTemp < config.lowBat) {
                    console.log("123123");
                    await utils.sendSMS(config.alertMethods.sms.number, "sns temp");

                    return;
                }
            }
        }

        //todo

        // sample is good, no alerts, update can send alerts to true
        await Unit.findByIdAndUpdate(unit._id, {canSendAlerts: true});


    }
}


module.exports.editUnit = async (req, res) => {
    try {
        let editItem = await Unit.findByIdAndUpdate(req.params.id, req.body);
        res.json({success: true, data: editItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.getUnitsByOwnerName = async (req, res) => {
    try {
        res.json(await Unit.find(req.params.user));
        console.log(req.params.user);
        console.log(req.user)
    } catch (e) {
        console.log(req.params.user);
        console.log(req.user);
        res.status(500).json({success: false, message: e})
    }
};


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


module.exports.relateUnitToUser = async (req, res) => {
    try {
        const unitId = req.body.unitId;
        const userId = req.body.userId;
        const unrelate = req.body.unrelate || false;

        if ( !unitId || (!userId && !unrelate)) {
            return res.status(400).json({success: false, message: 'please enter valid data'});
        }

        const unit = await Unit.findOne({unitId: unitId});
        if (!unit) {
            return res.status(400).json({success: false, message: 'unit was not found'});
        }
        //  const user = await User.findById(unitId);

        unit.user = userId;
        await unit.save();

        res.json({success: true});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};

