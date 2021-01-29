import React, { PureComponent } from 'react';
import { FormField, PanelOptionsGroup, PanelEditorProps } from '@grafana/ui';
import { SimpleOptions } from '../types';

interface State {
  text: string;
}

export class SimplePanelEditor extends PureComponent<
  PanelEditorProps<SimpleOptions>,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      feedUrl: props.options.text,
    };
  }

  onUpdatePanel = () =>
    this.props.onOptionsChange({ ...this.props.options, text: this.state.feedUrl });

  onFeedUrlChange = ({ target }) => this.setState({ text: target.value });

  render() {
    const { feedUrl } = this.state;

    return (
      <>
        <PanelOptionsGroup title="Feed">
          <div className="gf-form">
            <FormField
              label="Feed url"
              labelWidth={6}
              inputWidth={25}
              value={feedUrl}
              onChange={this.onFeedUrlChange}
              onBlur={this.onUpdatePanel}
            />
          </div>
        </PanelOptionsGroup>
      </>
    );
  }
}


