const express = require('express');
const router = express.Router();
const Commongrocery = require('../models/commongrocery')
const Propergrocery = require('../models/propergrocery')
 
function getoutputMap(data,childMap,indexMap,queryParams){
    return new Promise((resolve,reject)=>{
        if(data && data.length > 0){
            resolve(indexMap)
            queryParams.forEach(async (t,i)=>{
            if(data[0].name.match(t.name.$regex)){
                if(childMap.has(i)){
                    if(indexMap.has(childMap.get(i))){
                        let value = indexMap.get(childMap.get(i)) +' ' +data[0].name
                        await indexMap.set(childMap.get(i),value)
                    } else{
                        await indexMap.set(childMap.get(i),data[0].name)
                        }
                    }
                }
            })
        }
   })
}

function getChildMap(items){
    return new Promise((resolve,reject)=>{
    let childMap = new Map()
    let queryParams =[]
    Array.from(new Map(Object.entries(items)).values()).forEach((item,index)=>{
        resolve({childMap:childMap,queryParams:queryParams})
        item.forEach((i)=>{
            childMap.set(childMap.size,index)
            queryParams.push({ name: { $regex: new RegExp(i,'i') }})
        })
    })
})
}
router.get('/commongroceryguess',  async(req, res, next) => {
    try {
        await getChildMap(req.query.items).then(async(data)=>{
            const response1 = await Propergrocery.find(
                {
                    $or: data.queryParams
                },{_id:0, name:1})
                const response2 = await Commongrocery.find(   
                {
                        $or: data.queryParams
                },{_id:0, name:1})
                const result = await getoutputMap(response1,data.childMap,new Map(),data.queryParams)
                await getoutputMap(response2,data.childMap,result,data.queryParams).then(function(value){
                    let finalResult = []
                    Array.from(value.values()).forEach((v)=>{
                        finalResult.push(v)
                    })
                    res.send( {finalResult:finalResult});
                }) 
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