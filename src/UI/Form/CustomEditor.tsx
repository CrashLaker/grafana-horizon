import React from 'react'

import { 
  Input,
 } from '@grafana/ui'

const customEditor = (props) => {
  //console.log('customeditor', props)
  if (!props.value){
    props.value = {
      margin: '2'
    }
  }
  const changeInput = (e) => {
    //console.log('event', e)
    props.onChange({
      margin: e.target.value
    })
  }
  return (
    <div>
      <Input
        type="text"
        value={props.value.margin}
        onChange={changeInput}
      />
      


    </div>
  )
}

export default customEditor