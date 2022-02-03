/*
Copyright (c) Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/

// @flow
import * as React from 'react';
import {getOverride, getOverrideProps} from '../helpers/overrides.js';
import {UIDConsumer} from 'react-uid';
import {
  Label as StyledLabel,
  LabelEndEnhancer as StyledLabelEndEnhancer,
  LabelContainer as StyledLabelContainer,
  Caption as StyledCaption,
  ControlContainer as StyledControlContainer,
} from './styled-components.js';
import type {FormControlPropsT, FormControlStateT} from './types.js';

function chooseRenderedHint(caption, error, positive, sharedProps) {
  if (error && typeof error !== 'boolean') {
    return typeof error === 'function' ? error(sharedProps) : error;
  }

  if (positive && typeof positive !== 'boolean') {
    return typeof positive === 'function' ? positive(sharedProps) : positive;
  }

  if (caption) {
    return typeof caption === 'function' ? caption(sharedProps) : caption;
  }

  return null;
}

export default class FormControl extends React.Component<
  FormControlPropsT,
  FormControlStateT,
> {
  static defaultProps = {
    overrides: {},
    label: null,
    caption: null,
    disabled: false,
    counter: false,
  };

  render() {
    const {
      overrides: {
        Label: LabelOverride,
        LabelEndEnhancer: LabelEndEnhancerOverride,
        LabelContainer: LabelContainerOverride,
        Caption: CaptionOverride,
        ControlContainer: ControlContainerOverride,
      },
      label,
      caption,
      disabled,
      error,
      positive,
      htmlFor,
      children,
      counter,
    } = this.props;

    const onlyChildProps = React.Children.only(children).props;

    const sharedProps = {
      $disabled: !!disabled,
      $error: !!error,
      $positive: !!positive,
    };

    const Label = getOverride(LabelOverride) || StyledLabel;
    const LabelEndEnhancer =
      getOverride(LabelEndEnhancerOverride) || StyledLabelEndEnhancer;
    const LabelContainer =
      getOverride(LabelContainerOverride) || StyledLabelContainer;
    const Caption = getOverride(CaptionOverride) || StyledCaption;
    const ControlContainer =
      getOverride(ControlContainerOverride) || StyledControlContainer;

    const hint = chooseRenderedHint(caption, error, positive, sharedProps);

    if (__DEV__) {
      if (error && positive) {
        // eslint-disable-next-line no-console
        console.warn(
          `[FormControl] \`error\` and \`positive\` are both set to \`true\`. \`error\` will take precedence but this may not be what you want.`,
        );
      }
    }

    let labelEndEnhancer = this.props.labelEndEnhancer;
    if (counter) {
      let maxLength: ?number = null;
      let length: ?number = null;

      if (typeof counter === 'object') {
        length = counter.length;
        maxLength = counter.maxLength;
      }

      maxLength = maxLength ?? onlyChildProps.maxLength;
      if (length == null && typeof onlyChildProps.value === 'string') {
        length = onlyChildProps.value.length;
      }

      if (length == null) {
        length = 0;
        console.warn(
          'baseui: from-control length must either be explicitly set via counter prop, or value prop as a string "value" prop on the child component.',
        );
      }
      labelEndEnhancer =
        maxLength == null ? `${length}` : `${length}/${maxLength}`;
    }

    return (
      <React.Fragment>
        {label && (
          <LabelContainer
            {...sharedProps}
            {...getOverrideProps(LabelContainerOverride)}
          >
            <Label
              data-baseweb="form-control-label"
              htmlFor={htmlFor || onlyChildProps.id}
              {...sharedProps}
              {...getOverrideProps(LabelOverride)}
            >
              {typeof label === 'function' ? label(sharedProps) : label}
            </Label>
            {labelEndEnhancer && (
              <LabelEndEnhancer
                {...sharedProps}
                {...getOverrideProps(LabelEndEnhancerOverride)}
              >
                {typeof labelEndEnhancer === 'function'
                  ? labelEndEnhancer(this.props)
                  : labelEndEnhancer}
              </LabelEndEnhancer>
            )}
          </LabelContainer>
        )}
        <UIDConsumer>
          {captionId => (
            <ControlContainer
              data-baseweb="form-control-container"
              {...sharedProps}
              {...getOverrideProps(ControlContainerOverride)}
            >
              {React.Children.map(children, (child, index) => {
                if (!child) return;

                const key = child.key || String(index);
                return React.cloneElement(child, {
                  key,
                  'aria-errormessage': error ? captionId : null,
                  'aria-describedby': caption || positive ? captionId : null,
                  disabled: onlyChildProps.disabled || disabled,
                  error:
                    typeof onlyChildProps.error !== 'undefined'
                      ? onlyChildProps.error
                      : error,
                  positive:
                    typeof onlyChildProps.positive !== 'undefined'
                      ? onlyChildProps.positive
                      : positive,
                });
              })}
              {(caption || error || positive) && (
                <Caption
                  data-baseweb="form-control-caption"
                  id={captionId}
                  {...sharedProps}
                  {...getOverrideProps(CaptionOverride)}
                >
                  {hint}
                </Caption>
              )}
            </ControlContainer>
          )}
        </UIDConsumer>
      </React.Fragment>
    );
  }
}
