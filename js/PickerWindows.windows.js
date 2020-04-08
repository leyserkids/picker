/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 * @format
 * @flow strict-local
 */

'use strict';

import React from 'react';
import {
  processColor,
  requireNativeComponent,
  NativeModules,
  StyleSheet,
} from 'react-native';

const REF_PICKER = 'picker';

import type {SyntheticEvent} from 'CoreEventTypes';
import type {TextStyleProp} from 'StyleSheet';

const RCTPicker = requireNativeComponent('RCTPicker');

type PickerWindowsChangeEvent = SyntheticEvent<
  $ReadOnly<{|
    nativeEvent: {
      value: any,
      itemIndex: number,
      text: string,
    },
  |}>,
>;

type PickerWindowsProps = $ReadOnly<{|
  children?: React.Node,
  style?: ?TextStyleProp,
  // tslint:disable-next-line:no-any
  selectedValue?: any,
  enabled?: boolean,
  prompt?: string,
  testID?: string,
  onChange?: (event: IPickerChangeEvent) => void,
  // tslint:disable-next-line:no-any
  onValueChange?: (value: any, itemIndex: number, text: string) => void,
  // Editable support
  editable?: boolean,
  text?: string,
|}>;

type Item = $ReadOnly<{|
  label: string,
  // tslint:disable-next-line:no-any
  value?: any,
  color?: string,
  testID?: string,
|}>;

type PickerWindowsState = {|
  selectedIndex: number,
  items: $ReadOnlyArray<Item>,
|};

/**
 * Not exposed as a public API - use <Picker> instead.
 */

class PickerWindows extends React.Component<
  PickerWindowsProps,
  PickerWindowsState,
> {
  static getDerivedStateFromProps(
    props: PickerWindowsProps,
  ): PickerWindowsState {
    let selectedIndex = -1;
    const items: Item[] = [];
    React.Children.toArray(props.children).forEach(
      (c: React.ReactNode, index: number) => {
        const child = (c: Item);
        if (child.props.value === props.selectedValue) {
          selectedIndex = index;
        }
        items.push({
          value: child.props.value,
          label: child.props.label,
          textColor: processColor(child.props.color),
        });
      },
    );
    return {selectedIndex, items};
  }

  state = PickerWindows.getDerivedStateFromProps(this.props);

  render() {
    const nativeProps = {
      enabled: this.props.enabled,
      items: this.state.items,
      onChange: this._onChange,
      selectedIndex: this.state.selectedIndex,
      testID: this.props.testID,
      style: [styles.pickerWindows, this.props.style, this.props.itemStyle],
    };

    return (
      <RCTPicker
        ref={this._setRef}
        {...nativeProps}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
      />
    );
  }

  _setRef = (comboBox: PickerWindows) => {
    this._rctPicker = comboBox;
  };

  _onChange = (event: PickerWindowsChangeEvent) => {
    if (this._rctPicker) {
      this._rctPicker.setNativeProps({
        selectedIndex: this.state.selectedIndex,
        text: this.props.text,
      });
    }

    this.props.onChange && this.props.onChange(event);
    this.props.onValueChange &&
      this.props.onValueChange(
        event.nativeEvent.value,
        event.nativeEvent.itemIndex,
        event.nativeEvent.text,
      );
  };
}

const styles = StyleSheet.create({
  pickerWindows: {
    height: 32,
  },
});

export default PickerWindows;
