const express = require('express');
const router = express.Router();
const Commongrocery = require('../models/commongrocery')
const Propergrocery = require('../models/propergrocery')
const Usergrocery = require('../models/usergrocery')
const Usergroceries = require('../models/usergroceries')

function getoutputMap(data,childMap,indexMap,queryParams,field){
    return new Promise((resolve,reject)=>{
        if(data && data.length > 0){
            data.forEach((d)=>{
                queryParams.forEach((t,i)=>{
                    if((field === 'name' && d.get("name") === t) || (field === 'abbr' && d.get("abbr").includes(t))){
                        if(childMap.has(i)){
                            if(indexMap.has(childMap.get(i))){
                                let value = indexMap.get(childMap.get(i)) +' ' + d.get("name")
                                indexMap.set(childMap.get(i),value)
                            } else{
                                indexMap.set(childMap.get(i),d.get("name"))
                                }
                            }
                    }
                })
            })
            
        }
        resolve(indexMap)
   })
}

function getChildMap(items){
    return new Promise((resolve,reject)=>{
    let childMap = new Map()
    let queryParams =[]
    items.forEach((item,index)=>{
        if(item && item.length > 0){
            item.forEach((i)=>{
                childMap.set(childMap.size,index)
                queryParams.push({ name: { $regex: new RegExp(i,'i')}})
            })
        }
    })
    resolve({childMap:childMap,queryParams:queryParams})
}
)}

function getISODate(date){
    const dateParts = new Date(date).toLocaleDateString("en-US").split('/');
    const isoDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    return isoDate
}

router.post('/getgrocery', async(req,res,next)=>{
    try {
        let childMap = new Map()
        let newChildMap = new Map()
        const newArray =  req.body.items.map((string,index) => string.split(" ")).reduce((p,c,ci)=> p +','+ ci+c ).split(',');
        let nameParams =[]
        let abbrParams=[]
        if(newArray && newArray.length > 0){
            let index = 0
            newArray.forEach((i)=>{
                let item = i
                if(i.match(/.*\d.*/)){
                    const itemIndex = i.search(/[a-zA-Z]/);
                    index = parseInt(i.slice(0, itemIndex));
                    item = i.slice(itemIndex);
                }
                abbrParams.push(item)
                newChildMap.set(newChildMap.size,index)
                nameParams.push({ name: { $regex: new RegExp(item,'i')}})
            })
        }
        req.body.items.forEach((item,index)=>{
            childMap.set(childMap.size,index)})
            const response1 = await Propergrocery.find(
                {
                    //$or: nameParams,
                    $or:[
                        {name:req.body.items},
                        {abbr:{$in:abbrParams}}

                    ]

                },{_id:0, name:1, abbr:1})
                const response2 = await Commongrocery.find(   
                {
                    name:{$in: req.body.items}
                },{_id:0, name:1, abbr:1})

                if(response1.length > 0 || response2.length > 0){
                    //const result = await getoutputMap(response1,childMap,new Map(),req.query.items,false)

                    await getoutputMap(response1,childMap,new Map(),req.body.items,'name').then(async function(value){
                        let result = new Map()
                        if(value.size === 0){
                            await getoutputMap(response1,newChildMap,new Map(),abbrParams,'abbr').then(function(newValue){
                                result = newValue
                            })
                        } else{
                            result = value
                        }
                        let finalResult = []
                        Array.from(result.keys()).forEach((k,i)=>{
                            finalResult.push({abbr:req.body.items[k], name:result.get(k), index :k})
                        })
                        res.send( {finalResult:finalResult});
                        }) 
                } else{
                    res.send( {finalResult:[]});
                }
    } catch (error) {
        res.status(500).send('An error occurred');
    }
})

router.get('/guessgrocery',  async(req, res, next) => {
    try {
        await getChildMap(Array.from(new Map(Object.entries(req.query.items)).values())).then(async(data)=>{
            const response1 = await Propergrocery.find(
                {
                    $or: data.queryParams
                },{_id:0, name:1, abbr:1})
                const response2 = await Commongrocery.find(   
                {
                        $or: data.queryParams
                },{_id:0, name:1, abbr:1})
                if(response1.length > 0 || response2.length > 0){
                    //const result = await getoutputMap(response1,data.childMap,new Map(),data.queryParams,true)
                    await getoutputMap(response2,data.childMap,new Map(),data.queryParams,true).then(function(value){
                    let finalResult = []
                    Array.from(value.keys()).forEach((k,i)=>{
                        finalResult.push({abbr:req.query.items[k], name:value.get(k), index:k,response:response1})
                    })
                    res.send( {finalResult:finalResult});
                    }) 
                } else{
                    res.send( {finalResult:[]});
                }
                
            })
    } catch (error) {
        res.status(500).send('An error occurred');
    }
});

router.get('/getcommongrocery', (req, res, next) => {
    // get placeholder
    Commongrocery.find({}, {_id:0, name:1})
        .then((data) => res.json(data))
        .catch(next);
});

/*router.post('/putusergrocery', (req, res, next) => {
    const {purchaseDate,queryItems} = req.body
    let isoDate = getISODate(purchaseDate)
    let names = queryItems.map((i)=>i.name)
    Usergrocery.find({ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()),
        items:{$elemMatch: {
            name: { $in: names }}
          }},
    ).then((data)=>{
        if(data && data.length > 0){
            //let nameArray = data[0].items.map((d,i)=>d.name)
            let nameAndDetailsArray = data[0].items.reduce((acc, details) => {
                acc[details.name] = { qty: details.qty, abbr: details.abbr };
                return acc;},{})
            queryItems.forEach((item,i)=>{
                if(nameAndDetailsArray[item.name]){
                    //let index = nameArray.indexOf(item.name)
                    item.qty = parseInt(item.qty) + parseInt(nameAndDetailsArray[item.name].qty)
                }
            })
            
        }
        Usergrocery.updateOne({ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate())},
            {$pull:{items:{name: { $in: names }}}}).then(()=>{
                Usergrocery.updateOne({ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate())},
                    {
                        $push: { items: {$each: queryItems}}},
                        { upsert:true}
                    ).then((data) => {
                        res.json(data)})
                        .catch(next);
              })
        
        })
    })*/

router.get('/getusergrocery', (req, res, next) => {
    let isoStartDate =getISODate(req.query.startDate);
    let isoEndDate =getISODate(req.query.endDate);
    
    Usergrocery.aggregate([
        {$match:{"purchaseDate":{$lte:new Date(isoEndDate.getFullYear(), isoEndDate.getMonth(), isoEndDate.getDate()),
            $gte:new Date(isoStartDate.getFullYear(), isoStartDate.getMonth(), isoStartDate.getDate())
        }}},
        {$unwind: "$items"},
          {$group: {
            _id:"$items.name", details: { $push: "$$ROOT" },count: { $count: { } }
          }
        },
        {
            $addFields:
              {
                qty : { $sum: "$details.items.qty" },
              }
          },
          {$sort:{purchaseDate:1}},
          {
            $project:{
              name:"$_id",details:1,count:1,qty:1,
             _id:false} }
      ]).then((data) => {
        res.json(data)})
    .catch(next);
        
    /*Usergrocery.find({ purchaseDate:{$lte:new Date(isoEndDate.getFullYear(), isoEndDate.getMonth(), isoEndDate.getDate()),
        $gte:new Date(isoStartDate.getFullYear(), isoStartDate.getMonth(), isoStartDate.getDate())
    }}, {_id:0}).sort({purchaseDate: 1})
        .then((data) => {
            console.log(data)
            res.json(data)})
        .catch(next);*/
    });

/*router.get('/getallusergrocery', (req, res, next) => {
    let skip = req.query.page && req.query.rowsPerPage ? req.query.page * req.query.rowsPerPage :0
    let limit = req.query.rowsPerPage ? parseInt(req.query.rowsPerPage): 0
    Usergrocery.aggregate([
        {$unwind: "$items"},
          {$group: {
            _id:"$items.name", details: { $push: "$$ROOT" },
            count: { $count: { } } 
          }
        },
        {
            $addFields:
              {
                qty : { $sum: "$details.items.qty" }
              }
          },
          {$sort:{"_id":-1}},
          //{$skip:skip},
          //{$limit:limit},
          {
            $project:{
              name:"$_id",details:1,count:1,qty:1,
             _id:false} }
      ]).then((data) => {
        res.json(data)})
    .catch(next);
        
});*/

router.post('/putusergrocery', (req, res, next) => {
    const {purchaseDate,queryItems} = req.body
    let isoDate = getISODate(purchaseDate)
    queryItems.forEach((item)=>{
        console.log(item.qty)
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
                //console.log(data)
            })
            } else {
            // If the date doesn't exist, push a new details element with the specified date and quantity
            Usergroceries.updateOne(
              { name: item.name },
              { $push: { details: { purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty } } }
            ).then((data)=>{
                console.log(data)
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
            console.log(data)
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

module.exports = router;