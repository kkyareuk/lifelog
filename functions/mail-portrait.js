// Persist the public portrait with the letter: the resident may later leave or
// move villages, while the recipient keeps the original mail.
module.exports=resident=>{
 let profile={};try{profile=JSON.parse(resident?.profileJson||'{}')}catch{}
 return [profile.icon,resident?.icon,profile.photo,resident?.photo].find(value=>typeof value==='string'&&/^https:\/\//i.test(value))||'';
};
