var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
const { response } = require('express')
const { Forbidden } = require('http-errors')

module.exports = {

    doRegister: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collections.ADMIN_COLLECTION).insertOne(userData).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    addDoctor: (doctorData) => {
        return new Promise(async (resolve, reject) => {
            doctorData.password = await bcrypt.hash(doctorData.password, 10)
            let data = {
                firstname: doctorData.fname,
                lastname: doctorData.lname,
                phone: doctorData.phone,
                gender: doctorData.gender,
                specialized: doctorData.specialized,
                speciality: doctorData.speciality,
                password: doctorData.password
            }
            db.get().collection(collections.DOCTORS_COLLECTION).insertOne(data).then((response) => {
                resolve(response.ops[0]._id)
            })
        })
    }
}