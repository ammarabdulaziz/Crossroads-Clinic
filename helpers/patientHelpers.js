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
                userData.status = 'active'
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

    getAvailability: (date, docId) => {
        return new Promise(async (resolve, reject) => {
            bookedSessions = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{
                    $match:
                    {
                        date: date,
                        docId: docId,
                        status: {
                            $not: {
                                $in: ['cancelled', 'blocked']
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        time: 1
                    }
                }]
            ).toArray()

            let sessionArray = [{ time: '09:00 Am' }, { time: '09:30 Am' }, { time: '10:00 Am' }, { time: '10:30 Am' }, { time: '11:00 Am' }, { time: '11:30 Am' },
            { time: '12:00 Pm' }, { time: '12:30 Pm' }, { time: '01:00 Pm' }, { time: '02:30 Pm' }, { time: '03:00 Pm' }, { time: '03:30 Pm' },
            { time: '04:00 Pm' }, { time: '04:30 Pm' }, { time: '05:00 Pm' }, { time: '05:30 Pm' }, { time: '06:00 Pm' }, { time: '06:30 Pm' }, { time: '07:00 Pm' }]

            let result = sessionArray.filter(o1 => !bookedSessions.some(o2 => o1.time === o2.time));
            resolve(result)
        })
    },

    bookAppointment: (bookingDetails, patient, docId) => {
        return new Promise(async (resolve, reject) => {
            bookingDetails.patientId = patient._id
            bookingDetails.name = patient.name
            let doctor = await db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docId) });
            bookingDetails.doctor = doctor
            bookingDetails.docId = docId
            bookingDetails.status = 'requested'
            db.get().collection(collections.APPOINTMENTS_COLLECTION).insertOne(bookingDetails).then((response) => {
                resolve(response.ops[0])
            })
        })
    },

    getAppointments: (patientId) => {
        return new Promise(async (resolve, reject) => {
            let appointments = []
            appointments.requested = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { patientId: objectId(patientId), status: "requested" } }]
            ).toArray()
            appointments.cancelled = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { patientId: objectId(patientId), status: "cancelled" } }]
            ).toArray()
            appointments.approved = await db.get().collection(collections.APPOINTMENTS_COLLECTION).aggregate(
                [{ $match: { patientId: objectId(patientId), status: "approved" } }]
            ).toArray()
            resolve(appointments)
        })
    },

    editProfile: (profileDetails, patientId) => {
        return new Promise(async (resolve, reject) => {
            if (profileDetails.password) {
                profileDetails.password = await bcrypt.hash(profileDetails.password, 10)
            } else {
                // Retrieve the existing password
                let patient = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ _id: objectId(patientId) })
                profileDetails.password = patient.password
            }
            db.get().collection(collections.PATIENTS_COLLECTION).updateOne({ _id: objectId(patientId) }, {
                $set: {
                    name: profileDetails.name,
                    phone: profileDetails.phone,
                    email: profileDetails.email,
                    password: profileDetails.password,
                    gender: profileDetails.gender,
                    place: profileDetails.place,
                    dob: profileDetails.dob
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    cancelAppointment: (appId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.APPOINTMENTS_COLLECTION).updateOne({ _id: objectId(appId) }, {
                $set: {
                    status: "cancelled"
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    checkBlocked: (docId, patientId, myPatient) => {
        return new Promise(async (resolve, reject) => {
            let blockedArray = null
            let docDetails = await db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docId) })
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
            response.message = undefined
            check = blockedArray.filter(blocked => blocked.blockedBy.docId === docId);
            if (check.length != 0) {
                response.message = `You have been blocked by Dr. ${docDetails.firstname} ${docDetails.lastname} for Malpractices. You may have booking with other doctors. Thank You.`
            }
            resolve(response)
        })
    },

    getConsultations: (patientId) => {
        return new Promise(async (resolve, reject) => {
            let consultations = await db.get().collection(collections.CONSULTATIONS_COLLECTION).find({ patientId: objectId(patientId) }).toArray()
            resolve(consultations)
        })
    },

    getPrescriptionDetails: (appId) => {
        return new Promise(async (resolve, reject) => {
            let presc = await db.get().collection(collections.CONSULTATIONS_COLLECTION).find({ appId: objectId(appId) }).toArray()
            resolve(presc)
        })
    },

    exportData: (patientId, docId) => {
        return new Promise(async (resolve, reject) => {
            let presc = await db.get().collection(collections.CONSULTATIONS_COLLECTION).aggregate(
                [{ $match: { patientId: objectId(patientId), docId: objectId(docId) } }]
            ).toArray()
            resolve(presc)
        })
    }
}