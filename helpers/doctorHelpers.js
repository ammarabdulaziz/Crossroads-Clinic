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
            db.get().collection(collections.DOCTORS_COLLECTION).insertOne(userData).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    getBookings: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            doctorId = doctorId.toString()
            let bookings = await db.get().collection(collections.APPOINTMENTS_COLLECTION).find({ docId: doctorId }).toArray();
            resolve(bookings)
        })
    }
}