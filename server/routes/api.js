const express = require('express');
const router = express.Router();
const UserInventories = require('../models/userinventories')
const ScannedGroceries = require('../models/scannedgroceries')
const UserShopping = require('../models/usershoppinglist')
const UserAccount = require('../models/useraccount')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

function getISODate(date){
    const dateParts = new Date(date).toLocaleDateString("en-US").split('/');
    const isoDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    return isoDate
}

router.post('/putusershoppinglist', (req, res, next) => {
    const {listName, queryItems, userId} = req.body
    try{
        UserShopping.updateOne({userId:userId,listName:listName},{$set: { items:queryItems}}, {upsert:true})
        .then((data)=>{
            res.json(data)
        })
    } catch(e){
        console.log(e)
    }
   
})

router.get('/getusershoppinglistnames', (req,res,next)=>{
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1]) {
         userId = userId[1]
        try{
            UserShopping.find({userId:userId},{_id:0,listName:1}).then((data)=>{
                res.json(data)
            })
        } catch(e){
            console.log(e)
        }
    }
})

router.delete('/deleteshoppinglistbyname', (req,res,next)=>{
    const listName = req.query.listName
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
        if (userId && userId[1] && listName && listName !== '') {
            userId = userId[1]
            try{
                UserShopping.deleteOne({userId:userId,listName:listName}).then((data)=>{
                    res.json(data)
                })
            } catch(e){
                console.log(e)
            }
        }
})

router.get('/getshoppinglistbyname', (req,res,next)=>{
    const listName = req.query.listName
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
        if (userId && userId[1]) {
            userId = userId[1]
            try{
                UserShopping.findOne({userId:userId,listName:listName},{_id:0,"items.name":1,"items.qty":1}).then((data)=>{
                    res.json(data)
                })
            } catch(e){
                console.log(e)
            }
        }
})

router.post('/putusergrocery', (req, res, next) => {
    const {purchaseDate,queryItems,userId} = req.body
    const isoDate = getISODate(purchaseDate)
    try{
        queryItems.forEach((item)=>{
        UserInventories.findOne({userId:new ObjectId(userId), name: item.name}).then((documentToUpdate)=>{
        if (documentToUpdate ) {
            const dateExists = documentToUpdate.details.some(detail => 
            detail.purchaseDate.getTime() === new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()).getTime()
            );
            if (dateExists) {
                UserInventories.updateOne(
                { userId:new ObjectId(userId), name: item.name, "details.purchaseDate": new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()) },
                { $inc: { "details.$.qty": item.qty } }).then((data)=>{
                    //res.json(data)
                })
            } else {
                UserInventories.updateOne(
                { userId:new ObjectId(userId), name: item.name },
                { $push: { details: { purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty } } })
                .then((data)=>{//res.json(data)
                })
            }
            } else {
            UserInventories.create({
            userId:new ObjectId(userId),
            name: item.name,
            used:0,
            details: [{ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty }]}).then((data)=>{
                //res.json(data)
            })
        }})
    })
    } catch(e){
        res.json({success:false})
    } finally{
        res.json({success:true})
    }
})

router.get('/getallusergrocery', (req, res, next) => {
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1]) { 
        userId = userId[1]
        try{
            UserInventories.aggregate([
            { $match:{userId: new ObjectId(userId)}},
            { $addFields:{
                qty : { $sum: "$details.qty" },
                left:{ $subtract: [ {$sum: "$details.qty"},  "$used"]},
                lastPurchaseDate:{$max:"$details.purchaseDate"},
                firstPurchaseDate:{$min:"$details.purchaseDate"},
                daysTillNow:{
                $dateDiff:
                    {
                        startDate: {$min:"$details.purchaseDate"},
                        endDate: new Date(),
                        unit: "day"
                    }
                }
            }},
            {
                $project:{
                    name:1,details:1,qty:1,used:1, left:1, lastPurchaseDate:1, firstPurchaseDate:1, daysTillNow:1, count: {$size: "$details"},_id:false} }])
                    .then((data) => {
                        res.json(data)
                    })
        } catch(e){
            console.log(e)
        }
    }
    });

router.post('/updateusergrocerybyname', (req,res,next)=>{
    const{name,used,userId} = req.body
    try{
        UserInventories.updateOne({userId:new ObjectId(userId),name:name},{used:used})
        .then((data)=>{res.json(data)})

    } catch(e){
        console.log(e)
    }
})

router.get('/getscannedgrocerybycode', (req,res,next)=>{
    const code = req.query.code
    try{
        ScannedGroceries.findOne({code:code}).then((data)=>{
            res.json(data)
        })
    }catch(e){
        console.log(e)
    }
})

router.post('/confirmuser', (req, res, next) => {
    const {email, creationDate} = req.body
    if(email && email !== null && creationDate && creationDate !== null){
        try{
            UserAccount.findOneAndUpdate({email:email},{ $setOnInsert: { email: email, creationDate: creationDate } },
            { upsert: true}).then((data)=>{
                res.json(data)
            })
        } catch(e){
            console.log(e)
        }
    } else{
        res.json({status:'Login Failed!'})
    }
   
})

module.exports = router;