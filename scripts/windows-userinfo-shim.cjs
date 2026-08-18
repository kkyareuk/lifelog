// Node 24/libuv can fail to read a Windows account name that contains Korean
// while Capacitor's terminal helper starts. Supply the same non-sensitive
// account fields from the process environment only when that OS lookup fails.
const os=require("node:os");
const originalUserInfo=os.userInfo.bind(os);
os.userInfo=(options)=>{
  try{return originalUserInfo(options)}catch{
    const encoding=options?.encoding||"utf8";
    const username=String(process.env.USERNAME||"windows-user");
    const homedir=String(process.env.USERPROFILE||process.cwd());
    if(encoding==="buffer"){
      return {username:Buffer.from(username),uid:-1,gid:-1,shell:null,homedir:Buffer.from(homedir)};
    }
    return {username,uid:-1,gid:-1,shell:null,homedir};
  }
};
