const express = require('express');
const router = express.Router();
const usersCtrl = require('../ctrl/usersCtrl');
const scanDataCtrl = require('../ctrl/scanDataCtrl');
const configCtrl = require('../ctrl/configCtrl');
const unitCtrl = require('../ctrl/unitCtrl');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const companyCtrl = require("../ctrl/company");


// auth
router.get('/test', usersCtrl.test);
router.post('/login', usersCtrl.login);
router.post('/register', usersCtrl.register);
router.post('/forgot-password', usersCtrl.forgotPassword);
router.post('/reset-password', usersCtrl.resetPassword);
router.get('/sample', unitCtrl.sample);
router.get('/u-config', unitCtrl.getConfig);


// user must be authenticated (secure routes)

router.use(async (req, res, next) => {
    console.log('authentication middleware!');
    let token = req.headers['token'];
    if (!token) {
        return res.status(401).json({success: false, message: 'token not found'})
    }
//this function have 2 parameters: token and secret(biskvit...)
//jwt-json web token


    jwt.verify(token, require('../config').env.JWT_SECRET, async (err, data) => {
            if (err) return res.sendStatus(403);
            try {
                console.log(data);
                const userId = data.userId;
                const user = await User.findById(userId);
                req.user = user;
                next();
            } catch (e) {
                return res.sendStatus(403);
            }
        }
    );
});
//hyg

// users
router.get('/users', usersCtrl.getUsers); //route for get all users - for the admin
router.post('/users', usersCtrl.createUser); //route for get all users - for the admin
router.get('/users/:id', usersCtrl.getOneUser); //route for get all users - for the admin
router.put('/users/:id', usersCtrl.editUser); //route for get all users - for the admin
router.post('/units', usersCtrl.addUnit); // route for should not be in use
router.post('/attach-unit', usersCtrl.attachUnit); // route for attach one specific unit for the user
router.post('/register', usersCtrl.register);
router.delete('/users/:unitId', usersCtrl.deleteUser);
// units
router.put('/units/relate', unitCtrl.relateUnits); //route for delete one specific unit
router.get('/units', usersCtrl.getUnits);  //route for get all units- for the admin
router.get('/units', unitCtrl.getUnitsByOwnerName);
router.get('/units/:unitId', usersCtrl.getUnit);//route for get on specific unit
router.put('/units/:id', unitCtrl.editUnit);
router.put('/units/:unitId', usersCtrl.updateUnit); //route for update one specific unit
router.delete('/units/:unitId', usersCtrl.deleteUnit); //route for delete one specific unit
// router.get('/configs/:id', unitCtrl.SendEmail);

// configuration routes
router.get('/configs/:id', configCtrl.getOne);
router.post('/configs/:id/relateUnits', configCtrl.getOne);

router.route('/configs')
    .get(configCtrl.getAll)
    .post(configCtrl.createOne);

router.route('/configs/creator')
    .get(configCtrl.getByCreator);

router.route('/configs/:id')
    .get(configCtrl.getOne)
    .delete(configCtrl.deleteOne)
    .put(configCtrl.editOne);


// scan data routes
router.route('/scan-data')
    .get(scanDataCtrl.getAll)
    .post(scanDataCtrl.createOne);

router.route('/scan-data/:id')
    .get(scanDataCtrl.getOne)
    .delete(scanDataCtrl.deleteOne)
    .put(scanDataCtrl.editOne);


router.post('/relateUnitToUser', unitCtrl.relateUnitToUser); //route for delete one specific unit
//company
router.put('/company/:id', companyCtrl.editOneCompany);
router.route('/company').post(companyCtrl.createCompany);
router.route('/company/:id').get(companyCtrl.getOne)
router.route('/company').get(companyCtrl.getAll)

// units
// router.get('/units', usersCtrl.getUnits);

// scan data


router.get('/units/:unitId/scans', usersCtrl.getUnitScans); //route for get all scans of this unit

router.delete('/delete', unitCtrl.deleteData); //route for delets units
module.exports = router;

