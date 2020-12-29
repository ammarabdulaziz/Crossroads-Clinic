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
            consultDetails.speciality = doctorDetails.speciality
            consultDetails.appId = objectId(appId)
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
    },

    editProfile: (profileDetails, docId) => {
        return new Promise(async (resolve, reject) => {
            if (profileDetails.password) {
                profileDetails.password = await bcrypt.hash(profileDetails.password, 10)
            } else {
                // Retrieve the existing password
                let patient = await db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docId) })
                profileDetails.password = patient.password
            }
            db.get().collection(collections.DOCTORS_COLLECTION).updateOne({ _id: objectId(docId) }, {
                $set: {
                    firstname: profileDetails.firstname,
                    lastname: profileDetails.lastname,
                    phone: profileDetails.phone,
                    email: profileDetails.email,
                    password: profileDetails.password,
                    gender: profileDetails.gender,
                    place: profileDetails.place,
                    specialized: profileDetails.specialized,
                    dob: profileDetails.dob
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    getMyPatients: (docId) => {
        return new Promise(async (resolve, reject) => {
            console.log(docId)
            console.log(typeof docId)
            let myPatients = await db.get().collection(collections.CONSULTATIONS_COLLECTION).aggregate([
                {
                    $match:
                    {
                        docId: docId
                    }
                },
                {
                    $group:
                    {
                        _id: "$patientId"

                    }
                },
                {
                    $lookup:
                    {
                        from: 'patient',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'patient'
                    }
                },
                {
                    $unwind: "$patient"
                }
            ]).toArray()
            let blockedArray = null
            for (i = 0; i < myPatients.length; i++) {
                patientId = myPatients[i]._id
                blockedArray = await db.get().collection(collections.PATIENTS_COLLECTION).aggregate([
                    {
                        $match:
                        {
                            _id: objectId(patientId)
                        }
                    },
                    {
                        $unwind: "$blockedBy"
                    },
                    {
                        $project:
                        {
                            blockedBy: 1
                        }
                    }
                ]).toArray()
                check = blockedArray.filter(blocked => blocked.blockedBy.docId === docId.toString());
                if (check.length != 0) {
                    myPatients[i].status = "blocked"
                } if (check.length == 0) {
                    myPatients[i].status = "active"
                }
            }
            resolve(myPatients)
        })
    },

    blockPatient: (docId, patientId, appId) => {
        return new Promise((resolve, reject) => {
            docId = docId.toString()
            db.get().collection(collections.PATIENTS_COLLECTION).updateOne({ _id: objectId(patientId) }, {
                $push: {
                    blockedBy: { docId: docId }
                }
            }).then(() => {
                db.get().collection(collections.APPOINTMENTS_COLLECTION).updateOne({ _id: objectId(appId) }, {
                    $set: {
                        status: "blocked"
                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        })
    },

    unBlockPatient: (docId, patientId, appId) => {
        return new Promise((resolve, reject) => {
            docId = docId.toString()
            db.get().collection(collections.PATIENTS_COLLECTION).updateOne({ _id: objectId(patientId) }, {
                $unset : {
                    blockedBy: { docId: docId }
                }
            }).then(() => {
                db.get().collection(collections.APPOINTMENTS_COLLECTION).updateOne({ _id: objectId(appId) }, {
                    $set: {
                        status: "requested"
                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        })
    },

    getPreviousConsultations: (docId, patientId) => {
        return new Promise(async (resolve, reject) => {
            let previous = await db.get().collection(collections.CONSULTATIONS_COLLECTION).aggregate([
                {
                    $match:
                    {
                        docId: objectId(docId),
                        patientId: objectId(patientId)
                    }
                }
            ]).toArray()
            resolve(previous)
        })
    }
}