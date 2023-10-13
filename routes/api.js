const express = require('express');
const router = express.Router();
const Commongrocery = require('../models/commongrocery')
const Propergrocery = require('../models/propergrocery')
 
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

router.get('/getgrocery', async(req,res,next)=>{
    try {
        let childMap = new Map()
        let newChildMap = new Map()
        const newArray =  req.query.items.map((string,index) => string.split(" ")).reduce((p,c,ci)=> p +','+ ci+c ).split(',');
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
        req.query.items.forEach((item,index)=>{
            childMap.set(childMap.size,index)})
            const response1 = await Propergrocery.find(
                {
                    //$or: nameParams,
                    $or:[
                        {name:req.query.items},
                        {abbr:{$in:abbrParams}}

                    ]

                },{_id:0, name:1, abbr:1})
                const response2 = await Commongrocery.find(   
                {
                    name:{$in: req.query.items}
                },{_id:0, name:1, abbr:1})

                if(response1.length > 0 || response2.length > 0){
                    //const result = await getoutputMap(response1,childMap,new Map(),req.query.items,false)

                    await getoutputMap(response1,childMap,new Map(),req.query.items,'name').then(async function(value){
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
                            finalResult.push({abbr:req.query.items[k], name:result.get(k), index :k})
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

module.exports = router;