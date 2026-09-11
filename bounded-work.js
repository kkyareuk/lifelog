// Bound independent network work without starting an unbounded request burst.
export async function mapConcurrent(items,limit,work){
 const results=new Array(items.length);let next=0,failure;
 await Promise.all(Array.from({length:Math.min(Math.max(1,limit),items.length)},async()=>{
  while(!failure){const index=next++;if(index>=items.length)return;try{results[index]=await work(items[index],index)}catch(error){failure=error;}}
 }));if(failure)throw failure;return results;
}
