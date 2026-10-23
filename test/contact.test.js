const test=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/contact.js');
function req(overrides={},method='POST',headers={}){
 return {method,headers:{'content-type':'application/json',host:'law-2-dun.vercel.app',origin:'https://law-2-dun.vercel.app',...headers},
 body:{name:'Test Visitor',email:'visitor@example.com',phone:'8722420771',message:'I would like to discuss this sample site.',type:'DUI / DWI',urgency:'This month',contact:'Email',consent:'on',company_website:'',...overrides}};
}
function res(){return{code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this}}}
test('rejects incorrect method',async()=>{const r=res();await handler(req({},'GET'),r);assert.equal(r.code,405);assert.equal(r.body.ok,false)});
test('rejects invalid inputs and spam honeypot',async()=>{
 for(const v of [{email:'wrong'},{message:'a'},{consent:''},{company_website:'spammer'}]){
  const r=res();await handler(req(v),r);assert.equal(r.body.ok,false)
 }
});
test('rejects cross-site requests',async()=>{const r=res();await handler(req({},'POST',{origin:'https://malicious.example'}),r);assert.equal(r.code,403)});
test('never reports sent if key is missing',async()=>{
 const key=process.env.RESEND_API_KEY,from=process.env.CONTACT_FROM;
 delete process.env.RESEND_API_KEY;delete process.env.CONTACT_FROM;
 try{const r=res();await handler(req(),r);assert.equal(r.code,503);assert.equal(r.body.ok,false)}
 finally{if(key!==undefined)process.env.RESEND_API_KEY=key;if(from!==undefined)process.env.CONTACT_FROM=from}
});
test('actual provider receipt is required for success',async()=>{
 const old=global.fetch,key=process.env.RESEND_API_KEY,from=process.env.CONTACT_FROM;
 process.env.RESEND_API_KEY='fake-unit-test-key';process.env.CONTACT_FROM='website@verified.example';
 global.fetch=async(url,options)=>{
  assert.equal(url,'https://api.resend.com/emails');
  const b=JSON.parse(options.body);
  assert.deepEqual(b.to,['sierra@recoverrevenue.company']);assert.deepEqual(b.cc,['eric@reviro.com']);
  assert.equal(b.reply_to,'visitor@example.com');
  return {ok:true,status:200,json:async()=>({id:'real-from-mock-provider'})};
 };
 try{const r=res();await handler(req(),r);assert.deepEqual(r.body,{ok:true,id:'real-from-mock-provider'})}
 finally{global.fetch=old;if(key===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=key;if(from===undefined)delete process.env.CONTACT_FROM;else process.env.CONTACT_FROM=from}
});
test('provider rejection is not a fake success',async()=>{
 const old=global.fetch,key=process.env.RESEND_API_KEY,from=process.env.CONTACT_FROM;
 process.env.RESEND_API_KEY='fake-unit-test-key';process.env.CONTACT_FROM='website@verified.example';
 global.fetch=async()=>({ok:false,status:403,json:async()=>({name:'domain_not_verified'})});
 try{const r=res();await handler(req(),r);assert.equal(r.code,502);assert.equal(r.body.ok,false)}
 finally{global.fetch=old;if(key===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=key;if(from===undefined)delete process.env.CONTACT_FROM;else process.env.CONTACT_FROM=from}
});