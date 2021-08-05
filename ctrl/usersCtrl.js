const User = require('../model/user.model');
const Unit = require('../model/unit.model');
const ScanData = require('../model/scan-data.model');

const jwt = require('jsonwebtoken');
const config = require('../config');


module.exports.login = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) return res.status(400).json({
            success: false,
            message: 'please enter username and password'
        });

        let user = await User.findOne({email: email, password: password}); //search user with this data

        if (!user) return res.status(400).json({success: false, message: 'email or password are incorrect'}); //the name or password is encorrct
        const token = jwt.sign({userId: user._id, email: email}, config.env.JWT_SECRET); //new token
        let answer = user.toObject();
        if(answer.email=="idan")
            answer.role=="owner";



        delete answer.password;
        res.json({success: true, data: {token: token, user: answer}});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }

};

module.exports.register = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name || '';

        //if the user dont enter email or password
        if (!email || !password) return res.status(400).json({
            success: false,
            message: 'please enter email and password'
        });

        let user = await User.findOne({email: email, password: password}); //check if the mail is taken- why we have check the password???
        if (user) return res.status(400).json({success: false, message: 'email already taken'});

        //create a new user
        let newUser = await User.create({
            email,
            password,
            name,
        });

        res.json({success: true, data: newUser});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;

        //if the user dont enter email
        if (!email) return res.status(400).json({
            success: false,
            message: 'please enter email'
        });

        let user = await User.findOne({email: email});
        if (!user) return res.status(400).json({success: false, message: 'email was not found'});

        // generate forgot password token
        const token = jwt.sign({userId: user._id}, config.env.JWT_SECRET);
        user.forgotPasswordToken = token;
        await user.save();

        const serverUrl = 'http://localhost:4200/';
        const page = 'forgot-password?token=' + token;
        const url = serverUrl + page;

        // todo send by email

        res.json({success: true, data: url});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


module.exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = req.body.token;
        const newPassword = req.body.newPassword;

        //if the user dont enter email
        if (!resetPasswordToken || !newPassword) return res.status(400).json({
            success: false,
            message: 'please enter valid details'
        });

        let user = await User.findOne({forgotPasswordToken: resetPasswordToken});
        if (!user) return res.status(400).json({success: false, message: 'user was not found'});

        user.password = newPassword;
        await user.save();

        const token = jwt.sign({userId: user._id, email:user.email}, config.env.JWT_SECRET); //new token
        let answer = user.toObject();
        delete answer.password;
        res.json({success: true, data: {token: token, user: answer}});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

//get all users - for the admin
module.exports.getUsers = async (req, res) => {
    res.json(await User.find());
    // res.json(await Unit.find({user: userId}).populate('user'));
};

module.exports.getOneUser = async (req, res) => {
    const userId = req.params.id;
    res.json(await User.findOne({_id: userId}));
    // res.json(await Unit.find({user: userId}).populate('user'));
};

module.exports.editUser = async (req, res) => {
    try {
        let editItem = await User.findByIdAndUpdate(req.params.id, req.body);
        res.json({success: true, data: editItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

module.exports.createUser = async (req, res) => {
    try {
        let newItem = await User.create(req.body);
        res.json({success: true, data: newItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


//get one unit by id
module.exports.getUnit = async (req, res) => {
    const unitId = req.params.unitId;
    res.json(await Unit.findById(unitId));
    // res.json(await Unit.find({user: userId}).populate('user'));
};

//get units- if admin-get all,if user- get my 
module.exports.getUnits = async (req, res) => {
    const userId = req.user._id;
    const sortKey = req.query.sortBy || 'name';
    if (req.user.role === 'owner') {


        if (sortKey === 'user' || sortKey === '-user') {
            let list = await Unit.find({}).populate('user').populate('configuration');
            list = list.map(i => i.toObject());
            list = list.sort();
            //list.sort((a, b) => (a.user?.name > b.user?.name) ? -1 : ((b.user?.name > a.user?.name) ? 1 : 0));

            return res.json(list);
        }
        return res.json(await Unit.find({}).populate('user').populate('configuration').sort('user.name'));
    }

    res.json(await Unit.find({user: userId}).sort(sortKey).populate('configuration'));
};

//create new unit
module.exports.addUnit = async (req, res) => {
    try {
        const color = req.body.color || '#000000';
        const name = req.body.name;

        if (!name) return res.status(400).json({
            success: false,
            message: 'please enter unit name'
        });

        let newItem = await Unit.create({
            color,
            name,
            user: req.user,
        });

        res.json({success: true, data: newItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

//attach a unit to uesr, if not found- create a unit
module.exports.attachUnit = async (req, res) => {
    const uid = req.body.unitId; // real unit id (not DB id)

    // let user = await User.findById(userId);
    // if (!user) return res.status(400).json({success: false, message: 'user was not found'});

    try {

        // find relevant unit
        let unit = await Unit.findOne({unitId: uid});
        if (!unit) {
            unit = await Unit.create({
                user: req.user,
                unitId: uid
            });

            return res.json({success: true, data: unit});
        }

        unit.user = req.user;
        await unit.save();
        res.json({success: true, data: unit});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};


//why again????
module.exports.addUnit = async (req, res) => {
    const userId = req.params.id;
    try {
        const color = req.body.color || '#000000';
        const name = req.body.name;

        if (!name) return res.status(400).json({
            success: false,
            message: 'please enter unit name'
        });

        let user = await User.findById(userId);
        if (!user) return res.status(400).json({success: false, message: 'user was not found'});

        let newItem = await Unit.create({
            color,
            name,
            user,
        });

        res.json({success: true, data: newItem});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

//edit
module.exports.updateUnit = async (req, res) => {
    const unitId = req.params.unitId;
    try {
        const color = req.body.color || '#000000';
        const name = req.body.name;

        let unit = await Unit.findById(unitId);
        if (!unit) return res.status(400).json({success: false, message: 'unit was not found'});

        unit.color = color;
        unit.name = name;
        await unit.save();
        res.json({success: true, data: unit});

    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};

//delete one unit by id
module.exports.deleteUnit = async (req, res) => {
    const unitId = req.params.unitId;
    try {

        await Unit.deleteOne({_id: unitId});
        res.json({success: true, data: 'deleted'});
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
};
//forget password


//get all scans of specific unit
module.exports.getUnitScans = async (req, res) => {
    // todo - check that the unit belongs to the connected user (unit.user.id == req.user.id)
    const unitId = req.params.unitId;
    res.json(await ScanData.find({unitId: unitId}).sort('-time'));
};

