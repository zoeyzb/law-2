'use strict';
// Vercel Node function; do not report successful email unless the provider confirms it.
const TO='sierra@recoverrevenue.company', CC='eric@reviro.com';
const TOPICS=new Set(['Federal criminal defense','DUI / DWI','White-collar','Drug offense','Assault / violent crime','Appeal']);
const TIMELINES=new Set(['This week','This month','Just exploring']);
const METHODS=new Set(['Phone call','Text message','Email']);
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const error=(res,code,message)=>res.status(code).json({ok:false,error:message});
const value=(v,max)=>typeof v==='string'?v.trim().slice(0,max+1):'';

module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return error(res,405,'Method not allowed')}
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))
  return error(res,415,'Expected JSON');
 if(Number(req.headers['content-length']||0)>8192)return error(res,413,'Request too large');
 const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;
 if(origin){try{if(!host||new URL(origin).host!==host)return error(res,403,'Origin not allowed')}
  catch(_){return error(res,403,'Origin not allowed')}}
 let d=req.body;
 if(typeof d==='string'){try{d=JSON.parse(d)}catch(_){return error(res,400,'Invalid JSON')}}
 if(!d||typeof d!=='object'||Array.isArray(d))return error(res,400,'Invalid request');
 if(value(d.company_website,60))return error(res,400,'Invalid request');
 const name=value(d.name,100),email=value(d.email,254),phone=value(d.phone,30),
  message=value(d.message,1500),type=value(d.type,80),
  urgency=value(d.urgency,40),contact=value(d.contact,40);
 if(name.length<2||name.length>100||!EMAIL.test(email)||email.length>254||
    phone.length>30||phone.replace(/\D/g,'').length<7||message.length<10||
    message.length>1500||!TOPICS.has(type)||!TIMELINES.has(urgency)||
    !METHODS.has(contact)||d.consent!=='on')
  return error(res,422,'Please check the supplied fields');
 if(!process.env.RESEND_API_KEY||!process.env.CONTACT_FROM)
  return error(res,503,'Email sending has not been configured');
 const text=[
 'HMR fictional law website — project inquiry (NOT legal intake)',
 'Do not treat this message as attorney-client communication.','',
 'Name: '+name,'Email: '+email,'Phone: '+phone,
 'Website section: '+type,'Project timeline: '+urgency,
 'Preferred contact: '+contact,'','Message:',message
 ].join('\n');
 try{
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({
    from:process.env.CONTACT_FROM,to:[TO],cc:[CC],reply_to:email,
    subject:'HMR website concept — project inquiry',text
   }),
   signal:AbortSignal.timeout(10000)
  });
  const receipt=await response.json().catch(()=>({}));
  if(!response.ok||!receipt.id){
   console.error('Resend delivery rejected',response.status);
   return error(res,502,'Email provider did not accept the message');
  }
  return res.status(200).json({ok:true,id:receipt.id});
 }catch(err){
  console.error('Email provider unavailable',err.name);
  return error(res,502,'Email provider temporarily unavailable');
 }
};