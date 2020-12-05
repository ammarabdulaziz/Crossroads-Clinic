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

            var today = new Date();
            let month = today.toLocaleString('default', { month: 'short' });
            let year = today.getFullYear();
            let day = today.getDate();
            let hours = today.getHours();
            let minutes = today.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;

            let date = `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`

            doctorData.password = await bcrypt.hash(doctorData.password, 10)
            let data = {
                firstname: doctorData.fname,
                lastname: doctorData.lname,
                email: doctorData.email,
                phone: doctorData.phone,
                gender: doctorData.gender,
                specialized: doctorData.specialized,
                speciality: doctorData.speciality,
                password: doctorData.password,
                place: doctorData.place,
                date: date,
                doctor: true,
                status: 'active'
            }
            db.get().collection(collections.DOCTORS_COLLECTION).insertOne(data).then((response) => {
                resolve(response.ops[0]._id)
            })
        })
    },

    getDoctors: () => {
        return new Promise(async (resolve, reject) => {
            let doctors = await db.get().collection(collections.DOCTORS_COLLECTION).aggregate(
                [{ $match: { status: "active" } }]
            ).toArray()
            resolve(doctors)
        })
    },

    deleteDoctor: (docID) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.DOCTORS_COLLECTION).updateOne({ _id: objectId(docID) }, {
                $set: {
                    status: "deleted"
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    getDoctorDetails: (docID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docID) }).then((response) => {
                resolve(response)
            })
        })
    },

    editDoctor: (docID, doctorData) => {
        return new Promise(async (resolve, reject) => {
            if (doctorData.password) {
                doctorData.password = await bcrypt.hash(doctorData.password, 10)
            } else {
                // Retrieve the existing password
                let doc = await db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(docID) })
                doctorData.password = doc.password
            }
            db.get().collection(collections.DOCTORS_COLLECTION).updateOne({ _id: objectId(docID) }, {
                $set: {
                    firstname: doctorData.fname,
                    lastname: doctorData.lname,
                    email: doctorData.email,
                    phone: doctorData.phone,
                    gender: doctorData.gender,
                    specialized: doctorData.specialized,
                    speciality: doctorData.speciality,
                    password: doctorData.password
                }
            }).then((response) => {
                resolve(response)
            })
        })
    }
}