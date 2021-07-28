const ScanData = require('../model/scan-data.model');

module.exports.createOne = async (req, res) => {

    try {
        let newItem = await ScanData.create(req.body);
        res.json({success: true, data: newItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.getOne = async (req, res) => {
    try {
        res.json(await ScanData.findById(req.params.id));
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.getAll = async (req, res) => {
    try {
        res.json(await ScanData.find());
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.deleteOne = async (req, res) => {

    try {
        await ScanData.findByIdAndRemove(req.params.id);
        res.json({success: true});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.editOne = async (req, res) => {
    try {
        let editItem = await ScanData.findByIdAndUpdate(req.params.id, req.body);
        res.json({success: true, data: editItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


