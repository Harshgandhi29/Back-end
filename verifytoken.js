const jwt = require('jsonwebtoken')

module.exports = function (req,res,next){
const authHeader = req.headers['authorization'];
const token =  authHeader && authHeader.split(' ')[1]
if(!token) return res.status(401).send('access denied')
const verfied = jwt.verify (token,process.env.ACCESS_TOKEN_SECRET,(err,data)=>{
console.log(data)
if (err) return res.status(403)
req.user = data;
console.log('next')
next();
})

}
