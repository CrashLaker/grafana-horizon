import {
  makeSketchy
} from '../vis_aux'

export const horizonVis = (idx, pre) => {
  const {mirror, sketchy, width, height, barWidth, bezelOffset, colorPos, colorNeg} = pre.style
  const cval = pre.meta.data[idx]
  const {ctx} = pre
  const startX = pre.meta.x(cval.x)*barWidth + pre.meta.x(cval.x)*bezelOffset
  
  const {slices, yPos, bandPos, bandNeg, bandPosY, bandNegY} = pre.meta
  let color = 'grey'
  if (0){
    ctx.fillStyle = 'black'
    ctx.lineWidth = 0.1
    ctx.strokeRect(0,0,width,height)
    //ctx.strokeRect(0,-height/2,width,height)
  }
  if (cval.y >= 0){
    for (let i = 0; i < bandPos.length-1; i++){
      if (cval.y < bandPos[i]) break
      color = colorPos[i]
      ctx.fillStyle = color
      ctx.strokeStyle = color
      let startY = bandPosY(cval.y-bandPos[i])

      if (sketchy)
        makeSketchy(ctx, startX, -height+startY+startY, barWidth, height+(height-startY)-startY)
      else
        ctx.fillRect(startX, -height+startY+startY, barWidth, height+(height-startY)-startY)
      //ctx.fillRect(100, -100, barWidth, height+100)

    }
  }else{ // negative val
    for (let i = 0; i < bandNeg.length-1; i++){
      if (cval.y > bandNeg[i]) break
      color = colorNeg[i]
      ctx.fillStyle = color
      ctx.strokeStyle = color
      let startY = bandNegY(cval.y-bandNeg[i]) // -20 - - 10
      //ctx.fillRect(startX, height, barWidth, height-startY)
      if(mirror){
        if (sketchy)
          makeSketchy(ctx, startX, -height+startY+startY, barWidth, height+(height-startY)-startY)
        else
          ctx.fillRect(startX, -height+startY+startY, barWidth, height+(height-startY)-startY)
      }else{
        if (sketchy)
          makeSketchy(ctx, startX, 0, barWidth, height+(height-startY)-startY)
        else
          ctx.fillRect(startX, 0, barWidth, height+(height-startY)-startY)
      }
    }
  }
}