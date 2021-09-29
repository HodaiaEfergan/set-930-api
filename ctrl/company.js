const Company = require('../model/company.model');

module.exports.createOne = async (req, res) => {

    try {
        let newItem = await Company.create(req.body);
        res.json({success: true, data: newItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.getOne = async (req, res) => {
    try {
        res.json(await Company.findById(req.params.id));
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.getAll = async (req, res) => {
    try {
        res.json(await Company.find());
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.deleteOne = async (req, res) => {

    try {
        await Company.findByIdAndRemove(req.params.id);
        res.json({success: true});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.editOneCompany = async (req, res) => {
    try {
        let editItem = await Company.findByIdAndUpdate(req.params.id, req.body);
        res.json({success: true, data: editItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


