export const ROOM_LAYOUT_GRID=Object.freeze({columns:12,rows:16,minColumns:2,minRows:2});

const finiteOr=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// 저장된 방 배치는 퍼센트 좌표다. 로드할 때 격자로 다시 반올림하면 작은
// 방이 앱을 열 때마다 커질 수 있으므로 여기서는 유효 범위만 보정한다.
export function normalizeRoomLayout(layout){
  if(!layout||typeof layout!=="object"||Array.isArray(layout))return null;
  const cellX=100/ROOM_LAYOUT_GRID.columns,cellY=100/ROOM_LAYOUT_GRID.rows;
  const width=clamp(finiteOr(layout.w,cellX*ROOM_LAYOUT_GRID.minColumns),cellX*ROOM_LAYOUT_GRID.minColumns,100);
  const height=clamp(finiteOr(layout.h,cellY*ROOM_LAYOUT_GRID.minRows),cellY*ROOM_LAYOUT_GRID.minRows,100);
  return{
    x:clamp(finiteOr(layout.x,0),0,100-width),
    y:clamp(finiteOr(layout.y,0),0,100-height),
    w:width,
    h:height
  };
}

// 사용자가 손잡이를 움직이는 순간에만 12×16 격자에 맞춘다.
export function snapRoomLayout(layout){
  const normalized=normalizeRoomLayout(layout)||normalizeRoomLayout({});
  const {columns,rows,minColumns,minRows}=ROOM_LAYOUT_GRID,cellX=100/columns,cellY=100/rows;
  const widthCells=clamp(Math.round(normalized.w/cellX),minColumns,columns);
  const heightCells=clamp(Math.round(normalized.h/cellY),minRows,rows);
  const xCells=clamp(Math.round(normalized.x/cellX),0,columns-widthCells);
  const yCells=clamp(Math.round(normalized.y/cellY),0,rows-heightCells);
  return{x:xCells*cellX,y:yCells*cellY,w:widthCells*cellX,h:heightCells*cellY};
}
