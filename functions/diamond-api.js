'use strict';
const express=require('express');
module.exports=({db,signedInUser})=>{
 const app=express(),wallet=require('./diamond-wallet').createWallet({db}),sandboxWallet=require('./diamond-wallet').createWallet({db,sandbox:true});
 app.use(express.json({limit:'4kb'}));
 app.use((req,res,next)=>{res.set('Access-Control-Allow-Origin','*');res.set('Access-Control-Allow-Headers','Authorization, Content-Type');res.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');if(req.method==='OPTIONS')return res.sendStatus(204);next()});
 for(const action of ['read','purchase','claim','prepareAd'])app.post('/'+action,async(req,res)=>{try{const identity=await signedInUser(req);res.json(await (req.body?.sandbox===true?sandboxWallet:wallet)[action](identity.uid,req.body||{}))}catch(e){res.status(e.status||503).json({code:e.status?e.message:'wallet-unavailable'})}});
 app.get('/admob-ssv',async(req,res)=>{try{const data=await require('./admob-ssv').verify(req.originalUrl.split('?')[1]||'');await wallet.rewardAd(data);res.json({received:true})}catch(e){res.status(e.status||503).json({received:false})}});
 return app;
};
