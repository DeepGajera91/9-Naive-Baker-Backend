const jwt = require('jsonwebtoken');

function auth(req,res,next){
    const token = req.header('auth-token');
    if(!token) {
        const response = {
            ok:false,
            data:{
            },
            err:{
                status:401,
                msg:"Please Login again"     
            }
        }
        return res.send(response);
    }

    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(err){
        const response = {
            ok:false,
            data:{
            },
            err:{
                status:401,
                msg:"Please Login again"     
            }
        }
        return res.send(response);
    }
}

module.exports = auth;