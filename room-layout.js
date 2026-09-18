export const ROOM_LAYOUT_GRID=Object.freeze({columns:12,rows:16,minColumns:2,minRows:2});

const finiteOr=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// 저장된 방 배치는 퍼센트 좌표다. 로드할 때 격자로 다시 반올림하면 작은
// 방이 앱을 열 때마다 커질 수 있으므로 여기서는 유효 범위만 보정한다.
export function homeGrid(home={}){return {columns:Math.max(12,Math.min(64,Math.round(Number(home.canvasColumns)||12))),rows:Math.max(16,Math.min(64,Math.round(Number(home.canvasRows)||16))),minColumns:2,minRows:2}}

export function normalizeRoomLayout(layout,grid=ROOM_LAYOUT_GRID){
  if(!layout||typeof layout!=="object"||Array.isArray(layout))return null;
  const cellX=100/grid.columns,cellY=100/grid.rows;
  const width=clamp(finiteOr(layout.w,cellX*grid.minColumns),cellX*grid.minColumns,100);
  const height=clamp(finiteOr(layout.h,cellY*grid.minRows),cellY*grid.minRows,100);
  return{
    x:clamp(finiteOr(layout.x,0),0,100-width),
    y:clamp(finiteOr(layout.y,0),0,100-height),
    w:width,
    h:height
  };
}

// 사용자가 손잡이를 움직이는 순간에만 12×16 격자에 맞춘다.
export function snapRoomLayout(layout,grid=ROOM_LAYOUT_GRID){
  const normalized=normalizeRoomLayout(layout,grid)||normalizeRoomLayout({},grid);
  const {columns,rows,minColumns,minRows}=grid,cellX=100/columns,cellY=100/rows;
  const widthCells=clamp(Math.round(normalized.w/cellX),minColumns,columns);
  const heightCells=clamp(Math.round(normalized.h/cellY),minRows,rows);
  const xCells=clamp(Math.round(normalized.x/cellX),0,columns-widthCells);
  const yCells=clamp(Math.round(normalized.y/cellY),0,rows-heightCells);
  return{x:xCells*cellX,y:yCells*cellY,w:widthCells*cellX,h:heightCells*cellY};
}

// Upgrade only legacy percentage layouts; repeated loads must not shrink rooms.
export function ensureHomeCanvas(home){
  if(home.canvasFitVersion!==1){
    const before=homeGrid(home),layouts=Object.values(home.rooms||{}).map(r=>r?.layout).filter(Boolean);
    const columns=Math.max(12,...layouts.map(r=>Math.ceil((r.x+r.w)*before.columns/100-1e-8)));
    const rows=Math.max(16,...layouts.map(r=>Math.ceil((r.y+r.h)*before.rows/100-1e-8)));
    for(const room of Object.values(home.rooms||{}))if(room?.layout){const r=room.layout;room.layout={x:r.x*before.columns/columns,y:r.y*before.rows/rows,w:r.w*before.columns/columns,h:r.h*before.rows/rows};}
    home.canvasColumns=columns;home.canvasRows=rows;home.canvasFitVersion=1;
  }
  home.canvasRows ||=16;
  return home;
}
export function scaleDefaultRooms(layouts,home){
  const grid=homeGrid(home);
  return Object.fromEntries(Object.entries(layouts).map(([key,r])=>[key,{x:r.x*12/grid.columns,y:r.y*16/grid.rows,w:r.w*12/grid.columns,h:r.h*16/grid.rows}]));
}
