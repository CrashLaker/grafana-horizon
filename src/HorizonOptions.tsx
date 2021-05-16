import React from 'react';
import { PanelOptionsEditorBuilder } from '@grafana/data';
import { HorizonOptions } from './types';

import SliderCustomEditor from './UI/Form/SliderCustomEditor'
import ColorPickerEditor from './UI/Form/ColorPickerEditor'
//import CustomEditor from './UI/Form/CustomEditor';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<HorizonOptions>) => {
  const category = ['Horizon']
  builder
    .addRadio({
      category,
      path: 'useVis',
      name: 'Select visualization type',
      defaultValue: 'regular',
      settings: {
        options: [
          {
            value: 'regular',
            label: 'Regular',
          },
          {
            value: 'horizon',
            label: 'Horizon',
          },
          {
            value: 'discrete',
            label: 'Discrete',
          },
          {
            value: 'barplot',
            label: 'BarPlot',
          },
          {
            value: 'dotplot',
            label: 'DotPlot',
          },
        ],
      }
    })
    .addBooleanSwitch({
      category,
      path: 'mirror',
      name: 'Mirror mirror negative values from top',
      defaultValue: false,
    })
    .addBooleanSwitch({
      category,
      path: 'sketchy',
      name: 'Turn draws sketchy',
      defaultValue: false,
    })
    .addBooleanSwitch({
      category,
      path: 'showLabels',
      name: 'Show Labels',
      defaultValue: false,
    })
    .addBooleanSwitch({
      category,
      path: 'showValuesRuler',
      name: 'Display ruler values',
      defaultValue: false,
    })

    addCustomCategory(builder, {
      category,
      id: 'seriesHeight',
      path: 'seriesHeight',
      name: 'Set series height',
      editor: SliderCustomEditor,
      defaultValue: [30],
      settings: {
        min: 10,
        max: 100,
        step: 5,
        orientation: 'horizontal',
        //value: [0],
        tooltipAlwaysVisible: false,
      }
    });

    addCustomCategory(builder, {
      category,
      id: 'seriesMargin',
      path: 'seriesMargin',
      name: 'Set margin between series',
      editor: SliderCustomEditor,
      defaultValue: [0],
      settings: {
        min: 0,
        max: 100,
        step: 5,
        orientation: 'horizontal',
        //value: [0],
        tooltipAlwaysVisible: false,
      }
    });

    addCustomCategory(builder, {
      category,
      id: 'bezelOffset',
      path: 'bezelOffset',
      name: 'Set bezel offset between datapoints',
      editor: SliderCustomEditor,
      defaultValue: [0],
      settings: {
        min: 0,
        max: 100,
        orientation: 'horizontal',
        //value: [0],
        tooltipAlwaysVisible: false,
      }
    });
    addCustomCategory(builder, {
      category,
      id: 'barWidth',
      path: 'barWidth',
      name: 'Set bar width',
      editor: SliderCustomEditor,
      defaultValue: [1],
      settings: {
        min: 1,
        max: 100,
        orientation: 'horizontal',
        //value: [1],
        tooltipAlwaysVisible: false,
      }
    });

    addCustomCategory(builder, {
      category,
      id: 'bgColor',
      path: 'bgColor',
      name: 'Set background color',
      editor: ColorPickerEditor,
      defaultValue: 'rgb(36, 38, 43)',
    })
    builder.addSelect({
      category: ['Data'],
      path: 'sort',
      name: 'Set sort',
      defaultValue: 'avg',
      settings: {
        options: [{
          value: 'none',
          label: 'None'
        }, {
          value: 'avg',
          label: 'Average'
        }, {
          value: 'max',
          label: 'Max'
        }, {
          value: 'min',
          label: 'Min'
        }, {
          value: 'last',
          label: 'Last'
        }, {
          value: 'percentile90',
          label: 'Percentile 90'
        }]
      }
    }).addBooleanSwitch({
      category: ['Data'],
      path: 'sortOrder',
      name: 'Sort Order Ascending?',
      defaultValue: false
    }).addBooleanSwitch({
      category: ['Data'],
      path: 'dummyData',
      name: 'Enable dummy data?',
      defaultValue: false
    });
    builder.addBooleanSwitch({
      category: ['Debug'],
      path: 'enableDebug',
      name: 'Enable Debug?',
      defaultValue: false
    }).addBooleanSwitch({
      category: ['Debug'],
      path: 'anonymize',
      name: 'Anonymize?',
      defaultValue: false
    });    
}

const addCustomCategory = (builder: PanelOptionsEditorBuilder<HorizonOptions>, props) => {
  builder
    .addCustomEditor({
      ...props,
    });
}

//const addCustomCategory = (builder: PanelOptionsEditorBuilder<SimpleOptions>) => {
//  const category = ['Horizon']
//
//  builder
//    .addCustomEditor({
//      category,
//      id: 'horizonOptions',
//      path: 'horizonOptions',
//      name: 'Set Custom Data Category',
//      editor: CustomEditor,
//      defaultValue: horizonDefaults,
//    });
//}