// For complete snapshots only: later pending snapshots replace earlier ones.
// The in-flight request is never cancelled; its revision is applied first.
export function latestSaveQueue(write){
 let pending,hasPending=false,running=null,done=Promise.resolve();
 return {
  get done(){return done},
  push(value){
   pending=value;hasPending=true;
   if(!running){
    running=Promise.resolve().then(async()=>{
     try{while(hasPending){const value=pending;hasPending=false;pending=undefined;await write(value)}}
     finally{running=null;pending=undefined;hasPending=false}
    });
    done=running;
   }
   return running;
  }
 };
}
