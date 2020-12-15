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

    getBookings: (doctorId, today) => {
        return new Promise(async (resolve, reject) => {
            doctorId = doctorId.toString()
            let bookings = []
            bookings.requested = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "requested" } }]
            ).toArray()
            bookings.cancelled = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "cancelled" } }]
            ).toArray()
            bookings.approved = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "approved" } }]
            ).toArray()
            bookings.consulted = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "consulted" } }]
            ).toArray()
            bookings.today = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "approved", date: today } }]
            ).toArray()
            bookings.upcoming = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "approved", date: { "$gt": today } } }]
            ).toArray()
            bookings.expired = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { docId: doctorId, status: "approved", date: { "$lt": today } } }]
            ).toArray()
            resolve(bookings)
        })
    },

    approveAppointment: (appId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.APPOINTMENTS_COLLECTION).updateOne({ _id: objectId(appId) }, {
                $set: {
                    status: "approved"
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    consultPatient: (consultDetails, patientId, appId, doctorDetails) => {
        return new Promise(async (resolve, reject) => {
            consultDetails.patientId = objectId(patientId)
            consultDetails.docId = doctorDetails._id
            consultDetails.docName = doctorDetails.firstname + " " + doctorDetails.lastname
            db.get().collection(collections.CONSULTATIONS_COLLECTION).insertOne(consultDetails).then(() => {
                db.get().collection(collections.APPOINTMENTS_COLLECTION).updateOne({ _id: objectId(appId) }, {
                    $set: {
                        status: "consulted"
                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        })
    }
}