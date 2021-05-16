import {
  makeSketchy,
  hexToRgb,
} from '../vis_aux'


export const dotplotVis = (idx, pre) => {
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
  const {slices, yPos, yNeg, bandPos, bandNeg, bandPosY, bandNegY} = pre.meta

    if (0){
      ctx.fillStyle = 'black'
      ctx.lineWidth = 0.1
      ctx.strokeRect(0,height/2,width,height)
    }
    
    let yUse = yPos
    let color = 'grey'
    
    //if (0 && mirror){
    //  if (sketchy)
    //    makeSketchy(ctx, startX, yUse(cval.y), barWidth, height-yUse(cval.y))
    //  else
    //    ctx.fillRect(startX, yUse(cval.y), barWidth, height-yUse(cval.y))
    //}
    
    if (cval.y == 0){
      // skip 
    }else if (cval.y >= 0){
      for (let i = 0; i < bandPos.length-1; i++){
        if (bandPos[i] > cval.y) break
        ctx.fillStyle = `rgba(${hexToRgb(colorPos[i]).join(',')}, 0.2)`
        ctx.strokeStyle = colorPos[i]
        
        ctx.arc(startX, height/2, yUse(cval.y)/4, 0, 2*Math.PI)
        ctx.fill()
        
      }
    }else{
      yUse = yNeg
      for (let i = 0; i < bandNeg.length-1; i++){
        if (bandNeg[i] < cval.y) break
        ctx.fillStyle = `rgba(${hexToRgb(colorNeg[i]).join(',')}, 0.2)`
        ctx.strokeStyle = colorNeg[i]
        
        ctx.arc(startX, height/2, yUse(cval.y)/4, 0, 2*Math.PI)
        ctx.fill()
        
      }
    }
    
}
