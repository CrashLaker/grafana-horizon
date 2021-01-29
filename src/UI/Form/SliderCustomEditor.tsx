import React, { useRef } from 'react'

import { 
  Input,
  Slider,
 } from '@grafana/ui'

const SliderCustomEditor = (props) => {
  const inputRef = useRef()


  const changeInput = (e) => {
    props.onChange([+e.target.value])
  }

  const changeSlider = (e, real=false) => {
    if (real){
      props.onChange(e)
    }else{
      inputRef.current.value = e[0]
    }
  }
  
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <div style={{width: '50px'}}>
        <Input ref={inputRef} value={props.value || props.item.defaultValue}
                onChange={changeInput}
          />
      </div>
            

      <div style={{paddingBottom: '13px', paddingLeft: '5px', width: '100%'}}>
        <Slider
          {...props.item.settings}
          value={props.value || props.item.defaultValue}
          onChange={(v) => changeSlider(v)}
          onAfterChange={(v) => changeSlider(v, true)}
        />
      </div>

    </div>
  )
}

export default SliderCustomEditor
