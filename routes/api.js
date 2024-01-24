const express = require('express');
const router = express.Router();
const Usergroceries = require('../models/usergroceries')
const ScannedGroceries = require('../models/scannedgroceries')
const UserShopping = require('../models/usershoppinglist')

function getISODate(date){
    const dateParts = new Date(date).toLocaleDateString("en-US").split('/');
    const isoDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    return isoDate
}

router.post('/putusershoppinglist', (req, res, next) => {
    const {listName, queryItems} = req.body
    try{
        UserShopping.updateOne({listName:listName},{$set: { items:queryItems}}, {upsert:true}).then((data)=>{
            res.json(data)
        })
    } catch(e){
        console.log(e)
    }
   
})

router.get('/getusershoppinglistnames', (req,res,next)=>{
    UserShopping.find({},{_id:0,listName:1}).then((data)=>{
        res.json(data)
    })
})

router.get('/getshoppinglistbyname', (req,res,next)=>{
    const listName = req.query.listName
    UserShopping.findOne({listName:listName},{_id:0,"items.name":1,"items.qty":1}).then((data)=>{
        res.json(data)
    })
})

router.post('/putusergrocery', (req, res, next) => {
    const {purchaseDate,queryItems} = req.body
    let isoDate = getISODate(purchaseDate)
    queryItems.forEach((item)=>{
        Usergroceries.findOne({ name: item.name }).then((documentToUpdate)=>{
            if (documentToUpdate ) {
            const dateExists = documentToUpdate.details.some(detail => 
                detail.purchaseDate.getTime() === new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()).getTime()
            );
        
            if (dateExists) {
            // If the date exists, update the quantity in the matching details element
            Usergroceries.updateOne(
              { name: item.name, "details.purchaseDate": new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()) },
              { $inc: { "details.$.qty": item.qty } }
            ).then((data)=>{
            })
            } else {
            // If the date doesn't exist, push a new details element with the specified date and quantity
            Usergroceries.updateOne(
              { name: item.name },
              { $push: { details: { purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty } } }
            ).then((data)=>{
            })
            }
            } else {
            // If the document with itemName doesn't exist, create a new document
            Usergroceries.create({
                name: item.name,
                used:0,
                details: [{ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty }]
            });
            }
        }).then((data)=>{
            res.json(data)
        })
    })
})
router.get('/getallusergrocery', (req, res, next) => {
    Usergroceries.aggregate([
    {
        $addFields:
        {
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
        }
    },
    {
        $project:{
            name:1,details:1,qty:1,used:1, left:1, lastPurchaseDate:1, firstPurchaseDate:1, daysTillNow:1, count: {$size: "$details"},_id:false} }]).then((data) => {res.json(data)})
        .catch(next);
    });

router.post('/updateusergrocerybyname', (req,res,next)=>{
    const{name,used} = req.body
    Usergroceries.updateOne({name:name},{used:used}).then((data)=>{
        res.json(data)
    }).catch(next);
})

router.get('/getscannedgrocerybycode', (req,res,next)=>{
    const code = req.query.code
    ScannedGroceries.findOne({code:code}).then((data)=>{
        res.json(data)
    })
})

module.exports = router;