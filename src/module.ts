import { PanelPlugin  } from '@grafana/data';

import { HorizonPanel } from './HorizonPanel';

import { HorizonOptions } from './types';

import { optionsBuilder } from './HorizonOptions'

export const plugin = new PanelPlugin<HorizonOptions>(HorizonPanel)
  .setNoPadding()
  .setPanelOptions(optionsBuilder)
  .useFieldConfig()