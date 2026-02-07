import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { stringify } from "core/utils"

const NOOP = Function.prototype

export default class RequestBodyEditor extends PureComponent {

  static propTypes = {
    onChange: PropTypes.func,
    getComponent: PropTypes.func.isRequired,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    errors: PropTypes.array,
  }

  static defaultProps = {
    onChange: NOOP,
    userHasEditedBody: false,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      value: stringify(props.value) || ""
    }

    // Don't auto-populate with example values
    // Only set if there's an actual value (not defaultValue)
    if (props.value !== undefined && props.value !== null && props.value !== "") {
      props.onChange(props.value)
    }
  }

  applyDefaultValue = (nextProps) => {
    const { onChange, defaultValue } = (nextProps ? nextProps : this.props)

    this.setState({
      value: defaultValue
    })

    return onChange(defaultValue)
  }

  onChange = (value) => {
    this.props.onChange(stringify(value))
  }

  onJsonEditorChange = (value) => {
    // JsonEditor already provides a stringified value
    this.setState({
      value: value,
    }, () => this.props.onChange(value))
  }

  onDomChange = e => {
    const inputValue = e.target.value

    this.setState({
      value: inputValue,
    }, () => this.onChange(inputValue))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if(
      this.props.value !== nextProps.value &&
      nextProps.value !== this.state.value
    ) {

      this.setState({
        value: stringify(nextProps.value)
      })
    }

    // Removed auto-application of defaultValue
    // Examples should not auto-populate into input fields
  }

  render() {
    let {
      getComponent,
      errors,
    } = this.props

    let {
      value
    } = this.state

    let isInvalid = errors.size > 0 ? true : false
    const JsonEditor = getComponent("JsonEditor")

    return (
      <div className="body-param">
        {isInvalid && errors.size > 0 && (
          <div className="body-param__errors" style={{ color: "red", marginBottom: "10px" }}>
            {errors.join(", ")}
          </div>
        )}
        <JsonEditor
          value={value}
          onChange={this.onJsonEditorChange}
        />
      </div>
    )

  }
}
