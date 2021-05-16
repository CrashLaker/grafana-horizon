import {
  makeSketchy
} from '../vis_aux'

export const discreteVis = (idx, pre) => {
  //const {mirror, sketchy, width, height, barWidth, bezelOffset, colorPos, colorNeg} = pre.style
  const {mirror, sketchy, width, height, bezelOffset, colorPos, colorNeg} = pre.style
  const cval = pre.meta.data[idx]
  const {ctx} = pre
  //const startX = pre.meta.x(cval.x)*barWidth + pre.meta.x(cval.x)*bezelOffset
  const startX = pre.meta.x(cval.x)
  let barWidth = (idx == pre.meta.data.length-1)
                  ? width - pre.meta.x(cval.x)
                  : pre.meta.x(pre.meta.data[idx+1].x) - startX
  barWidth +=1 // check #21
  const {slices, yPos, bandPos, bandNeg, bandPosY, bandNegY} = pre.meta
  let color = 'grey'
  if (cval.y >= 0){
    for (let i = 0; i < bandPos.length-1; i++){
      if (cval.y > bandPos[i] && cval.y <= bandPos[i+1]){ // 0 < x <= 10
        color = colorPos[i]
        break
      }
    }
  }else{
    for (let i = 0; i < bandNeg.length-1; i++){
      if (cval.y < bandNeg[i] && cval.y >= bandNeg[i+1]){ // 0 > x >= -10
        color = colorNeg[i]
        break
      }
    }
  }

  if (cval.y != 0){
    ctx.fillStyle = color
    ctx.strokeStyle = color
    if (sketchy)
      makeSketchy(ctx, startX, 0, barWidth, height)
    else
      ctx.fillRect(startX, 0, barWidth, height)
  }
}