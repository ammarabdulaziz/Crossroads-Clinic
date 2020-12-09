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
            let userEmail = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ email: userData.email })
            let userPhone = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ phone: userData.phone })
            if (!userEmail && !userPhone) {
                userData.patient = true
                db.get().collection(collections.PATIENTS_COLLECTION).insertOne(userData).then((response) => {
                    resolve(response.ops[0])
                })
            } else if (userEmail && userPhone) {
                response.error = 'This Email Address and Phone Number alredy exists'
                resolve(response)
            } else if (userEmail) {
                response.error = 'This Email Address already exists'
                resolve(response)
            } else if (userPhone) {
                response.error = 'This Phone Number already exists'
                resolve(response)
            }
        })
    },

    checkPhone: (phone) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ phone: phone })
            resolve(user)
        })
    },

    bookAppointment: (bookingDetails, patientId, docId) => {
        return new Promise(async (resolve, reject) => {
            bookingDetails.patientId = patientId
            let doctor = await db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docId) });
            bookingDetails.doctor = doctor
            db.get().collection(collections.APPOINTMENTS_COLLECTION).insertOne(bookingDetails).then((response) => {
                resolve(response.ops[0])
            })
        })
    },

    getAppointments: (patientId) => {
        return new Promise(async (resolve, reject) => {
            let appointments = await db.get().collection(collections.APPOINTMENTS_COLLECTION).find({ patientId: objectId(patientId) }).toArray();
            resolve(appointments)
        })
    }
}