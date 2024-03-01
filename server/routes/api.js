const express = require('express');
const router = express.Router();
const UserInventories = require('../models/userinventories')
const ScannedGroceries = require('../models/scannedgroceries')
const UserShopping = require('../models/usershoppinglist')
const UserAccount = require('../models/useraccount')
const UserColaboration = require('../models/tempcollaboration')
const mongoose = require('mongoose');
//const nodemailer = require("nodemailer");
const ObjectId = mongoose.Types.ObjectId;
//const Queue = require('bull')
require('dotenv').config();
//const msgQueue = new Queue('msgqueue', process.env.REDDIS_URL);
//const hbs = require('nodemailer-express-handlebars')
const path = require('path');

/*const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./shared/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./shared/'),
};

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      pass: process.env.WORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
   });

transporter.use('compile', hbs(handlebarOptions))*/

function getISODate(date){
    const dateParts = new Date(date).toLocaleDateString("en-US").split('/');
    const isoDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    return isoDate
}

router.post('/editownershoppinglist', async(req,res,next)=>{
    const {listName, queryItems, editorEmail, ownerEmail} = req.body
    try{
        let ownerData = await UserAccount.findOne({email: ownerEmail})
        if(ownerData && ownerData._id){
            await UserShopping.updateOne({userId:ownerData._id,"shoppingLists.listName":listName,"shoppingLists.editors":editorEmail},
            {$set: { "shoppingLists.$[outer].items":queryItems}},
            { arrayFilters: [  
                { "outer.listName": listName},
            ] })
            .then((data)=>{
                res.json(data)
            })
        } else{
            res.status(400).send(new Error('Bad Request'))
        }
    } catch(e){
        res.status(400).send(new Error('Bad Request'))
    }

})

router.post('/putusershoppinglist', async (req, res, next) => {
    const {listName, queryItems} = req.body
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(listName && listName !== '' &&  mongoose.isValidObjectId(userId[1]) && queryItems && userId && userId[1]) {
        userId = userId[1]
        try{
            let userShopping = await UserShopping.findOne({userId:userId})
                if(userShopping && userShopping.shoppingLists){
                    let shoppingDetails = userShopping.shoppingLists.filter((d)=>d.listName === listName) 
                    if(shoppingDetails && shoppingDetails.length >0){
                        await UserShopping.updateOne({userId:userId,"shoppingLists.listName":listName},
                        {$set: { "shoppingLists.$[outer].items":queryItems}},
                        { arrayFilters: [  
                            { "outer.listName": listName},
                        ] })
                        .then((data)=>{
                            res.json(data)
                        })
                    } else{
                        await UserShopping.updateOne({userId:userId},
                        {$push: {shoppingLists:{listName:listName,items:queryItems}}})
                        .then((data)=>{
                            res.json(data)
                        })
                    }
                    
                } else{
                    await UserShopping.create({userId:userId,shoppingLists:[{listName:listName,items:queryItems}]})
                    .then((data)=>{
                        res.json(data)
                    })
                }
            
        } catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
})

router.get('/getusershoppinglistnames', async (req,res,next)=>{
    let listNames = {ownedLists:[],viewableLists:[],editableLists:[]}
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) {
         userId = userId[1]
        try{
            const userShoppingData = await UserShopping.find({userId:userId},{_id:0,"shoppingLists.listName":1,"shoppingLists.viewers":1,"shoppingLists.editors":1})
                if(userShoppingData && userShoppingData.length> 0){
                    userShoppingData[0].shoppingLists.filter((d,i)=>{
                        listNames.ownedLists.push({viewerEmails:d.viewers,editorEmails:d.editors,listName:d.listName})
                    })
                }
            const userData = await UserAccount.findOne({_id:userId,isColaborator:true},{email:1,isColaborator:1,colaboratorDetails:1})
                if(userData && userData.colaboratorDetails && userData.colaboratorDetails.length > 0){
                    for (const c of userData.colaboratorDetails) {
                        const res = await UserShopping.find({userId:c.ownerId,$or:[{"shoppingLists.viewers":userData.email},{"shoppingLists.editors":userData.email}]},
                            {_id:0,"shoppingLists.listName":1,"shoppingLists.viewers":1,"shoppingLists.editors":1})
                            if(res && res.length > 0){
                                res[0].shoppingLists.filter((d,i)=>{
                                    if(d.viewers.includes(userData.email)){
                                        listNames.viewableLists.push({ownerEmail:c.ownerEmail,listName:d.listName})
                                    }
                                    if(d.editors.includes(userData.email)){
                                        listNames.editableLists.push({ownerEmail:c.ownerEmail,listName:d.listName})
                                    }
                                })
                            }
                        }
            }
            res.json(listNames)
        } catch(e){
            console.log(e)
        }
    }else{
        res.status(400).send(new Error('Bad Request'))
    }
})

router.delete('/deleteshoppinglistbyname', async (req,res,next)=>{
    const listName = req.query.listName
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1]) && listName && listName !== '') {
        userId = userId[1]
        try{
            let deletedList = await UserShopping.findOneAndUpdate({userId:userId,"shoppingLists.listName":listName},
            {$pull:{shoppingLists:{listName:listName}}})
            if(deletedList && (deletedList.shoppingLists[0].viewers.length > 0 || deletedList.shoppingLists[0].editors.length>0)){
                let colaborators = [...deletedList.shoppingLists[0].viewers,...deletedList.shoppingLists[0].editors]
                await UserAccount.updateMany({email:{$in:colaborators},"colaboratorDetails.ownerId":userId},
                        {$pull: {
                            "colaboratorDetails.$[outer].details": { shoppinglistName: listName } }
                          },
                        { arrayFilters: [  
                            {"outer.ownerId": userId}
                        ] })
                        .then((data)=>{
                        })
            }
            res.json({status:200})
        } catch(e){
            console.log(e)
        }
    }else{
        res.status(400).send(new Error('Bad Request'))
    }
})

router.get('/getshoppinglistbyname', async (req,res,next)=>{
    const {listDetails, email} = req.query
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
        if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) {
            userId = userId[1]
            try{
                if(listDetails.permission === 'Owner' ){
                    UserShopping.aggregate([
                        { $match:{userId: new ObjectId(userId),"shoppingLists.listName":listDetails.listName}},
                        {
                            $project: {
                                shoppingLists: {
                                  $filter: {
                                     input: "$shoppingLists",
                                     as: "shopping",
                                     cond: { $eq: [ "$$shopping.listName", listDetails.listName ] }
                                  }
                               }
                            }
                        },
                        {
                            $addFields: {
                              permission:'owner',
                              ownedBy:email                           
                            }
                          },
                    ]).then((data)=>{
                        res.json(data)
                    })
                } else{
                let ownerData = await UserAccount.aggregate([
                        { $match:{email: email}},
                        {
                            $project: {
                                colaboratorDetails: {
                                  $filter: {
                                     input: "$colaboratorDetails",
                                     as: "owner",
                                     cond: { $eq: [ "$$owner.ownerEmail", listDetails.details.ownedBy ] }
                                  }
                               }
                            }
                        }
                    ])
                if(ownerData && ownerData.length>0){
                    UserShopping.aggregate([
                        { $match:{$and:[{userId: ownerData[0].colaboratorDetails[0].ownerId},{"shoppingLists.listName":listDetails.listName},
                        {$or:[{"shoppingLists.viewers":email},{"shoppingLists.editors":email}]}]}},
                        {
                            $project: {
                                shoppingLists: {
                                  $filter: {
                                     input: "$shoppingLists",
                                     as: "shopping",
                                     cond: { $eq: [ "$$shopping.listName", listDetails.listName ] },
                                     
                                  }, 
                               }
                            }
                        },
                        {
                            $addFields: {
                              permission:listDetails.permission,
                              ownedBy:ownerData[0].colaboratorDetails[0].ownerEmail
                            }
                          },
                        {$project:{_id:0, "shoppingLists.viewers":0,"shoppingLists.editors":0}}
                    ]).then((data)=>{
                        res.json(data)
                    })
                } else{
                    res.status(401).send(new Error('Unauthorized'))
                }
                }
                
            } catch(e){
                console.log(e)
            }
        }else{
            res.status(400).send(new Error('Bad Request'))
        }
})

const addInventoryPermission = async(permission,ownerId,email) =>{
    permission ==='edit'? 
    await UserInventories.updateOne({userId:new ObjectId(ownerId)}, 
    {$push:{editors:email}})
    : await UserInventories.updateOne({userId:new ObjectId(ownerId)}, 
    {$push:{viewers:email}})
    .then((data)=>{
    })

}

router.post('/setinventorycollaborator', async (req, res, next) => {
    const {colaboratorEmails,permission,invitationDate,level,ownerEmail} = req.body
    let ownerId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(mongoose.isValidObjectId(ownerId[1]) && ownerId && ownerId[1]) {
        ownerId = ownerId[1]
        try{
            colaboratorEmails.forEach(async (email)=>{    
                await UserAccount.findOne({email:email}).then( async(userExists)=>{
                    if(userExists){
                        if(userExists.isColaborator === true){
                            //iscolaborator with same owner and list modify else push new 
                            let index = -1
                            userExists.colaboratorDetails.filter((d,i)=>{
                                if(d.ownerId == ownerId){
                                    index = i}})
                            if(index !== -1){
                                let levelExists = userExists.colaboratorDetails[index].details.map((d,i)=> d.level).includes(level)
                                if(levelExists){
                                    await UserAccount.updateOne({email:email,"colaboratorDetails.ownerId":ownerId},
                                    {"$set":{"colaboratorDetails.$[outer].details.$[].permission": permission}},
                                    { arrayFilters: [  
                                        { "outer.ownerId": new ObjectId(ownerId)},
                                        { "level":level} ] }
                                ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await editInventoryPermission(permission,ownerId,email)
                                    }
                                })
                                } else{
                                    await UserAccount.updateOne({email:email,"colaboratorDetails.ownerId":ownerId},
                                    {$push:{"colaboratorDetails.$[outer].details":{permission:permission,level:level}}},
                                    { arrayFilters: [  
                                        { "outer.ownerId": new ObjectId(ownerId)}] }
                                    ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await addInventoryPermission(permission,ownerId,email)
                                    }
                                })
                                }
                               
                            } else{
                                await UserAccount.updateOne({email:email},
                                    {$push:{colaboratorDetails:{ownerId:ownerId,ownerEmail:ownerEmail,details:[{level:level,permission:permission}]}}}
                                ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await addInventoryPermission(permission,ownerId,email)
                                    }
                                })
                            }  
                        } else{
                            await UserAccount.updateOne({email:email},
                                {isColaborator:true,colaboratorDetails:[{ownerId:ownerId,ownerEmail:ownerEmail,details:[{level:level,permission:permission}]}]}
                            ).then( async (data)=>{
                                if(data && data.acknowledged && data.modifiedCount > 0){
                                    await addInventoryPermission(permission,ownerId,email)
                                }
                            })
                        }
                    } else{
                        await UserColaboration.updateOne({ownerId:ownerId,ownerEmail:ownerEmail,colaboratorEmail:email,level:level, shoppinglistName:listName},
                            { $set: { invitationDate: invitationDate,permission:permission} },
                            {upsert:true,$setOnInsert: { ownerId:ownerId,ownerEmail:ownerEmail,colaboratorEmail:email,
                            invitationDate: invitationDate,permission:permission, level:level} })
                            .then(async(data)=>{
                                /*await msgQueue.add({ data: {receiverEmail:email, 
                                    subject:`${ownerEmail} has sent a request to collaborate on auto-digest`,
                                    template:"emailtemplate",
                                    context: {
                                        ownerEmail:ownerEmail,
                                        listName:listName,
                                        permission:permission,
                                        company: 'auto-digest',
                                        accept:`http://localhost:3000/`
                                    }}},
                                    );*/
                            })
                    }
                })          
            })
            res.json({success:true})
        } catch(e){
            res.json({success:false})
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
})
router.post('/putusergrocery', async (req, res, next) => {
    const {purchaseDate,queryItems} = req.body
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(userId && userId[1] && mongoose.isValidObjectId(userId[1]) && purchaseDate && queryItems){
        userId = userId[1]
        const isoDate = getISODate(purchaseDate)
    try{
        let userInventories = await UserInventories.findOne({userId:userId})
        if (userInventories && userInventories.inventories && userInventories.inventories.length>0) {
            queryItems.forEach(async (item)=>{
            let inventoryDetails = userInventories.inventories.filter((d)=>d.name === item.name)
            if(inventoryDetails && inventoryDetails.length >0){
                const dateExists = inventoryDetails[0].details.some(detail => 
                    detail.purchaseDate.getTime() === new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()).getTime()
                    );
                    if (dateExists) {
                    let details = await UserInventories.updateOne(
                        { userId:userId, "inventories.name": item.name, 
                        "inventories.details.purchaseDate": new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()) },
                        {"$inc":{"inventories.$[outer].details.$[inner].qty": item.qty}},
                                { arrayFilters: [  
                                    { "outer.name": item.name},
                                    {"inner.purchaseDate":new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate())}
                                    ] }
                        )
                    } else {
                    let details = await UserInventories.updateOne(
                        { userId:userId, "inventories.name": item.name },
                        { $push: { "inventories.$[outer].details": { purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty },} },
                        { arrayFilters: [  
                            { "outer.name": item.name},
                            ] }
                        )
                    }
                } else{
                let details = await UserInventories.updateOne(
                        { userId:userId},
                        {$push:{inventories:{
                            name: item.name,
                            used:0,
                            details: [{ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), qty:item.qty }]
                        }}}
                        )
                }
            })
            } else {
                let inventories = queryItems.map((item,i)=>{ return {name: item.name,used:0,
                    details: [{ purchaseDate: new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate()), 
                    qty:item.qty }]}
                })
                let details = await UserInventories.create({
                userId:userId,
                inventories:inventories
                })
        }
            res.json({success:true})

        } catch(e){
            res.json({success:false})
        }
    } 
})
router.get('/getallusersgrocery', async (req, res, next) => {
    const {userEmails} = req.query
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) { 
        userId = userId[1]
        try{
           let users = await UserAccount.find({email:{$in:userEmails}})
           if(users && users.length > 0){
            let userIds = users.map((u)=>u._id)
            var conditions = users.map((value)=>{
                return { $cond: { if: { $eq: ["$userId", value._id] }, then: value.email, else: "$$REMOVE"} };
            });
            try{
                await UserInventories.aggregate([
                { $match:{userId: {$in:userIds}}},
                {
                    $project:{
                        inventories: {
                            $map: {
                              input: "$inventories",
                              as: "inventory",
                              in: {
                                $mergeObjects: [
                                  "$$inventory",
                                  { count: { $size: "$$inventory.details" } },
                                  {qty : {$sum : "$$inventory.details.qty"}},
                                  {left:{ $subtract: [ {$sum: "$$inventory.details.qty"},  "$$inventory.used"]}},
                                  {lastPurchaseDate:{$max:"$$inventory.details.purchaseDate"}},
                                  {firstPurchaseDate:{$min:"$$inventory.details.purchaseDate"}},
                                  {daysTillNow:{$dateDiff:
                                    {
                                        startDate:{$min:"$$inventory.details.purchaseDate"},
                                        endDate: new Date(),
                                        unit: "day"
                                    }}}
                                ]
                              }
                            }
                          },
                        _id:0,email:conditions} }
                        ])
                        .then((data) => {
                            res.json(data)
                        })
            } catch(e){
                console.log(e)
            }
           }
        } catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
    });


router.get('/getallusergrocery', (req, res, next) => {
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) { 
        userId = userId[1]
        try{
            UserInventories.aggregate([
            { $match:{userId: new ObjectId(userId)}},
            {
                $project:{
                    inventories: {
                        $map: {
                          input: "$inventories",
                          as: "inventory",
                          in: {
                            $mergeObjects: [
                              "$$inventory",
                              { count: { $size: "$$inventory.details" } },
                              {qty : {$sum : "$$inventory.details.qty"}},
                              {left:{ $subtract: [ {$sum: "$$inventory.details.qty"},  "$$inventory.used"]}},
                              {lastPurchaseDate:{$max:"$$inventory.details.purchaseDate"}},
                              {firstPurchaseDate:{$min:"$$inventory.details.purchaseDate"}},
                              {daysTillNow:{$dateDiff:
                                {
                                    startDate:{$min:"$$inventory.details.purchaseDate"},
                                    endDate: new Date(),
                                    unit: "day"
                                }}}
                            ]
                          }
                        }
                      },
                    _id:0} }])
                    .then((data) => {
                        res.json(data)
                    })
        } catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
    });

router.post('/updateusergrocerybyname', async(req,res,next)=>{
    const{email,name,used, isAccount, account} = req.body
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(userId && userId[1] && mongoose.isValidObjectId(userId[1])){
        userId = userId[1] 
        try{
            if(!isAccount){
                let user = await UserAccount.findOne({email:account})
                if(user){
                    userId = user._id
                    await UserInventories.updateOne({userId:new ObjectId(userId),"inventories.name":name,
                        "$in":{editors:email}},
                    {"$set":{"inventories.$[outer].used": used}},
                    { arrayFilters: [  
                        { "outer.name": name}
                    ] })
                    .then((data)=>{res.json(data)})
                }
            }
            else{
                await UserInventories.updateOne({userId:new ObjectId(userId),"inventories.name":name},
                {"$set":{"inventories.$[outer].used": used}},
                    { arrayFilters: [  
                        { "outer.name": name}
                ] })
                .then((data)=>{res.json(data)})
            }
            
        } catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
    
})

router.get('/getscannedgrocerybycode', async(req,res,next)=>{
    const {code} = req.query
    if(code){
        try{
            await ScannedGroceries.findOne({code:code}).then((data)=>{
                res.json(data)
            })
        }catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }   
})

async function getNewUserColaborationData(data,email){
    let colaboratorDataMap = new Map()
    data.forEach(async (d,i)=>{
        if(colaboratorDataMap.size >0){
            if(colaboratorDataMap.has('colaboratorDetails')){
                let colaboratorDetails = colaboratorDataMap.get('colaboratorDetails')
                let index = -1
                colaboratorDetails.colaboratorDetails.filter((c,ci)=>{
                if(c.ownerId.equals(d.ownerId)){
                        index = ci
                }})
                if(index !== -1){
                    colaboratorDetails.colaboratorDetails[index].details.push({level:d.level,permission:d.permission,shoppinglistName:d.shoppinglistName})
                } else{
                    colaboratorDetails.colaboratorDetails.push({ownerId:d.ownerId,ownerEmail:d.ownerEmail,details:[{level:d.level,permission:d.permission,shoppinglistName:d.shoppinglistName}]})
                }
                colaboratorDataMap.set('colaboratorDetails',colaboratorDetails)
            }
        } else{
            colaboratorDataMap.set('colaboratorDetails',{colaboratorDetails:[{ownerId:d.ownerId,ownerEmail:d.ownerEmail,details:[{level:d.level,permission:d.permission,shoppinglistName:d.shoppinglistName}]}]})
        }
        await addListPermission(d.permission,d.ownerId,d.shoppinglistName,email)
    })  
    return colaboratorDataMap
}
router.post('/confirmuser', async(req, res, next) => {
    const {email, creationDate} = req.body
    let googleId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(email && creationDate && googleId && googleId[1]){
        try{
            await UserAccount.findOne({email:email},{email:1,isColaborator:1,colaboratorDetails:1}).then( async(data)=>{
                if(data && data.email){
                    res.json(data)
                }else{
                    await UserColaboration.find(({colaboratorEmail:email})).then(async (data)=>{
                        let colaboratorDetails =[]
                        let isColaborator = false
                        if(data && data.length > 0){
                            let colaboratorDataMap = await getNewUserColaborationData(data,email)
                            colaboratorDetails =colaboratorDataMap.get('colaboratorDetails').colaboratorDetails
                            isColaborator = true
                        }
                    await UserAccount.create({
                        email:email,
                        creationDate: new Date(Date.now()),
                        isColaborator:isColaborator,
                        colaboratorDetails:colaboratorDetails
                    }).then((data)=>{
                        res.json(data)
                    })
                    await UserColaboration.deleteMany({colaboratorEmail:email})
                    })
                }
            })
        } catch(e){
            console.log(e)
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
})

router.get('/getcolaboratorsemail', (req,res,next)=>{
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) {
         userId = userId[1]
        try{
            UserAccount.find({"colaboratorDetails.ownerId":userId},
            {_id:0,email:1}).then((data)=>{
                res.json(data)
            })
        } catch(e){
            console.log(e)
        }
    }else{
        res.status(400).send(new Error('Bad Request'))
    }
})

router.get('/getowneremail', (req,res,next)=>{
    let {email} = req.query
    let userId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if (userId && userId[1] && mongoose.isValidObjectId(userId[1])) {
         userId = userId[1]
        try{
            UserAccount.findOne({email:email,"colaboratorDetails.details.level":'inventories'},
            {_id:0,"colaboratorDetails.ownerEmail":1,"colaboratorDetails.details":1}
           
            ).then((data)=>{
                res.json(data)
            })
        } catch(e){
            console.log(e)
        }
    }else{
        res.status(400).send(new Error('Bad Request'))
    }
})

async function addListPermission(permission,ownerId,listName,email)
{
    permission ==='edit'? 
        await UserShopping.updateOne({userId:new ObjectId(ownerId), "shoppingLists.listName":listName}, 
        {$push:{"shoppingLists.$[outer].editors":email}},
        { arrayFilters: [  
            { "outer.listName": listName},
        ] })
        : await UserShopping.updateOne({userId:new ObjectId(ownerId), "shoppingLists.listName":listName}, 
        {$push:{"shoppingLists.$[outer].viewers":email}},
        { arrayFilters: [  
            { "outer.listName": listName},
        ] }
        ).then((data)=>{
        })
}

async function editListPermission(permission,ownerId,listName,email)
{
    permission === 'edit'? 
        await UserShopping.updateOne({userId:new ObjectId(ownerId), "shoppingLists.listName":listName,"shoppingLists.viewers":email}, {
            $pull:{"shoppingLists.$[outer].viewers":{$in:email}},
            $push:{"shoppingLists.$[outer].editors":email}
            },
            { arrayFilters: [  
                { "outer.listName": listName},
            ] }
            ).then((data)=>{
            })
        : await UserShopping.updateOne({userId:new ObjectId(ownerId), "shoppingLists.listName":listName, "shoppingLists.editors":email}, {
            $pull:{"shoppingLists.$[outer].editors":{$in:email}},
            $push:{"shoppingLists.$[outer].viewers":email}},
            { arrayFilters: [  
                { "outer.listName": listName},
            ] }
            )
}

async function editInventoryPermission(permission,ownerId,email)
{
    permission === 'edit'? 
        await UserInventories.updateOne({userId:new ObjectId(ownerId), viewers:email}, {
            $pull:{viewers:{$in:email}},
            $push:{editors:email}
            }
            ).then((data)=>{
            })
        : await UserInventories.updateOne({userId:new ObjectId(ownerId), editors:email}, {
            $pull:{editors:{$in:email}},
            $push:{viewers:email}}
            )
}

router.post('/putcollaborator', async (req, res, next) => {
    const {colaboratorEmails,permission,invitationDate,level,listName,ownerEmail} = req.body
    let ownerId = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
    if(mongoose.isValidObjectId(ownerId[1]) && ownerId && ownerId[1]) {
        ownerId = ownerId[1]
        try{
            colaboratorEmails.forEach(async (email)=>{    
                await UserAccount.findOne({email:email}).then( async(userExists)=>{
                    if(userExists){
                        if(userExists.isColaborator === true){
                            let index = -1
                            userExists.colaboratorDetails.filter((d,i)=>{
                                if(d.ownerId == ownerId){
                                    index = i}})
                            if(index !== -1){
                                let shoppingListExists = userExists.colaboratorDetails[index].details.map((d,i)=> d.shoppinglistName).includes(listName)
                                if(shoppingListExists){
                                    await UserAccount.updateOne({email:email,"colaboratorDetails.ownerId":ownerId},
                                    {"$set":{"colaboratorDetails.$[outer].details.$[].permission": permission}},
                                    { arrayFilters: [  
                                        { "outer.ownerId": new ObjectId(ownerId)},
                                        { "shoppinglistName": listName, "level":level} ] }
                                ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await editListPermission(permission,ownerId,listName,email)
                                    }
                                })
                                } else{
                                    await UserAccount.updateOne({email:email,"colaboratorDetails.ownerId":ownerId},
                                    {"$push":{"colaboratorDetails.$[outer].details":{permission:permission,level:level,shoppinglistName:listName}}},
                                    { arrayFilters: [  
                                        { "outer.ownerId": new ObjectId(ownerId)}] }
                                    ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await addListPermission(permission,ownerId,listName,email)
                                    }
                                })
                                }
                                
                            } else{
                                await UserAccount.updateOne({email:email},
                                    {$push:{colaboratorDetails:{ownerId:ownerId,ownerEmail:ownerEmail,details:[{level:level,shoppinglistName:listName,permission:permission}]}}}
                                ).then(async (data)=>{
                                    if(data && data.acknowledged && data.modifiedCount > 0){
                                        await addListPermission(permission,ownerId,listName,email)
                                    }
                                })
                            }  
                        } else{
                            await UserAccount.updateOne({email:email},
                                {isColaborator:true,colaboratorDetails:[{ownerId:ownerId,ownerEmail:ownerEmail,details:[{level:level,shoppinglistName:listName,permission:permission}]}]}
                            ).then( async (data)=>{
                                if(data && data.acknowledged && data.modifiedCount > 0){
                                    await addListPermission(permission,ownerId,listName,email)
                                }
                            })
                        }
                    } else{
                        await UserColaboration.updateOne({ownerId:ownerId,ownerEmail:ownerEmail,colaboratorEmail:email,level:level, shoppinglistName:listName},
                            { $set: { invitationDate: invitationDate,permission:permission} },
                            {upsert:true,$setOnInsert: { ownerId:ownerId,ownerEmail:ownerEmail,colaboratorEmail:email,
                            invitationDate: invitationDate,permission:permission, level:level, shoppinglistName:listName} })
                            .then(async(data)=>{
                                /*await msgQueue.add({ data: {receiverEmail:email, 
                                    subject:`${ownerEmail} has sent a request to collaborate on auto-digest`,
                                    template:"emailtemplate",
                                    context: {
                                        ownerEmail:ownerEmail,
                                        listName:listName,
                                        permission:permission,
                                        company: 'auto-digest',
                                        accept:`http://localhost:3000/`
                                    }}},
                                    );*/
                            })
                    }
                })          
            })
            res.json({success:true})
        } catch(e){
            res.json({success:false})
        }
    } else{
        res.status(400).send(new Error('Bad Request'))
    }
})

/*msgQueue.process(async (job,done) => {
    const {receiverEmail,subject,template,context } = job.data.data;
    let mailOptions = {
        from: process.env.EMAIL,
        to: receiverEmail,
        subject:subject,
        template: template,
        context:context
      };
     
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {

        } else {
            done()
            
        }
      });
}).catch((e) => console.log(`Something went wrong: ${e}`));

msgQueue.on('completed', function (job, result) {
    job.remove()
})*/
  
module.exports = router;