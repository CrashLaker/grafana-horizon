import {
  makeSketchy
} from '../vis_aux'


export const regularVis = (idx, pre) => {
  //const {mirror, sketchy, width, height, barWidth, bezelOffset, colorPos, colorNeg} = pre.style
  const {mirror, sketchy, width, height, bezelOffset, colorPos, colorNeg} = pre.style
  const cval = pre.meta.data[idx]
  const {ctx} = pre
  //const startX = pre.meta.x(cval.x)*barWidth + pre.meta.x(cval.x)*bezelOffset
  const startX = pre.meta.x(cval.x)
  let barWidth = (idx == pre.meta.data.length-1)
                  ? width - pre.meta.x(cval.x)
                  : pre.meta.x(pre.meta.data[idx+1].x) - startX
  
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
        ctx.fillStyle = colorPos[i]
        ctx.strokeStyle = colorPos[i]
        
        let [ux, uy, uw, uh] = [startX, 
                                yUse(cval.y), 
                                barWidth, 
                                (i==0) ? height-yUse(cval.y) : height-yUse(cval.y-bandPos[i])]
        
        //console.log('bandpos', i, cval.y, ux, uy, uw, uh)
        
        if (sketchy)
          makeSketchy(ctx, ux, uy, uw, uh)
        else
          ctx.fillRect(ux, uy, uw, uh)
        
      }
    }else{
      yUse = yNeg
      for (let i = 0; i < bandNeg.length-1; i++){
        if (bandNeg[i] < cval.y) break
        ctx.fillStyle = colorNeg[i]
        ctx.strokeStyle = colorNeg[i]
        let ux,uy,uw,uh = 0
        
        if (mirror){
          [ux, uy, uw, uh] = [startX, 
                              yUse(cval.y), 
                              barWidth, 
                              (i==0) ? height-yUse(cval.y) : height-yUse(cval.y-bandNeg[i])]  
        }else{
          [ux, uy, uw, uh] = [startX, 
                              (i==0) ? 0 : height-yUse(bandNeg[i]),
                              barWidth,
                              height-yUse(cval.y-bandNeg[i])]
        }
        
        //console.log('bandpos', i, cval.y, ux, uy, uw, uh)
        
        if (sketchy)
          makeSketchy(ctx, ux, uy, uw, uh)
        else
          ctx.fillRect(ux, uy, uw, uh)
        
      }
    }
    
}