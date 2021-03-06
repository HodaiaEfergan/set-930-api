const Configuration = require('../model/configuration.model');
//const nodemailer = require('nodemailer');
const axios = require('axios').default

module.exports.createOne = async (req, res) => {
console.log("hi")
    try {
        console.log("hi1")
        let newItem = await Configuration.create(req.body);
        res.json({success: true, data: newItem});
    } catch (e) {
        console.log("hi2")
        res.status(500).json({success: false, message: e})
    }
};


module.exports.getOne = async (req, res) => {
    try {
        res.json(await Configuration.findById(req.params.id));
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.getByCreator = async (req, res) => {
    try {
        res.json(await Configuration.find(req.params.creator));
        console.log(req.params.creator);
        console.log(req.creator)
    } catch (e) {
        console.log(req.params.creator);
        console.log(req.creator)
        res.status(500).json({success: false, message: e})
    }
};


module.exports.getAll = async (req, res) => {
    try {
        res.json(await Configuration.find());
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.deleteOne = async (req, res) => {

    try {
        await Configuration.findByIdAndRemove(req.params.id);
        res.json({success: true});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.editOne = async (req, res) => {
    try {
        let editItem = await Configuration.findByIdAndUpdate(req.params.id, req.body);
        res.json({success: true, data: editItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};






