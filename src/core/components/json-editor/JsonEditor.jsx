/**
 * @prettier
 */
import React, { Component } from "react"
import PropTypes from "prop-types"

class JsonNode extends Component {
  static propTypes = {
    data: PropTypes.any,
    path: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    name: PropTypes.string,
    isRoot: PropTypes.bool,
  }

  state = {
    isExpanded: true,
    isEditingKey: false,
    isEditingValue: false,
    editValue: "",
  }

  toggleExpand = () => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }))
  }

  startEditValue = () => {
    const stringValue =
      typeof this.props.data === "string"
        ? this.props.data
        : JSON.stringify(this.props.data)
    this.setState({ isEditingValue: true, editValue: stringValue })
  }

  saveEditValue = () => {
    try {
      let newValue = this.state.editValue
      // Try to parse as JSON
      try {
        newValue = JSON.parse(newValue)
      } catch (e) {
        // If it fails, treat as string
        // Unless it's a number or boolean
        if (newValue === "true") newValue = true
        else if (newValue === "false") newValue = false
        else if (newValue === "null") newValue = null
        else if (!isNaN(newValue) && newValue.trim() !== "")
          newValue = Number(newValue)
      }
      this.props.onChange(this.props.path, newValue)
      this.setState({ isEditingValue: false })
    } catch (e) {
      alert("Invalid value")
    }
  }

  cancelEdit = () => {
    this.setState({ isEditingValue: false, isEditingKey: false })
  }

  addProperty = () => {
    if (Array.isArray(this.props.data)) {
      this.props.onChange([...this.props.path, this.props.data.length], "")
    } else {
      const newKey = prompt("Enter property name:")
      if (newKey && newKey.trim()) {
        this.props.onChange([...this.props.path, newKey.trim()], "")
      }
    }
  }

  deleteThis = () => {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.path)
    }
  }

  renderPrimitive(value) {
    const { isEditingValue, editValue } = this.state
    const valueType = typeof value
    const displayValue =
      value === null
        ? "null"
        : valueType === "string"
          ? `"${value}"`
          : String(value)

    if (isEditingValue) {
      return (
        <span className="json-edit-value">
          <input
            type="text"
            value={editValue}
            onChange={(e) => this.setState({ editValue: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") this.saveEditValue()
              if (e.key === "Escape") this.cancelEdit()
            }}
            autoFocus
          />
          <button onClick={this.saveEditValue} className="json-btn-save">
            ✓
          </button>
          <button onClick={this.cancelEdit} className="json-btn-cancel">
            ✕
          </button>
        </span>
      )
    }

    return (
      <span
        className={`json-value json-value-${valueType}`}
        onClick={this.startEditValue}
      >
        {displayValue}
      </span>
    )
  }

  render() {
    const { data, path, onChange, name, isRoot, onDelete } = this.props
    const { isExpanded } = this.state

    const isObject = typeof data === "object" && data !== null
    const isArray = Array.isArray(data)

    if (!isObject) {
      return (
        <div className="json-node json-node-primitive">
          {name && <span className="json-key">{name}: </span>}
          {this.renderPrimitive(data)}
          {onDelete && !isRoot && (
            <button onClick={this.deleteThis} className="json-btn-delete">
              🗑
            </button>
          )}
        </div>
      )
    }

    const keys = isArray
      ? data.map((_, i) => String(i))
      : Object.keys(data)
    const bracket = isArray ? ["[", "]"] : ["{", "}"]
    const isEmpty = keys.length === 0

    return (
      <div className={`json-node ${isRoot ? "json-node-root" : ""}`}>
        <div className="json-node-header">
          <button
            onClick={this.toggleExpand}
            className="json-toggle"
            disabled={isEmpty}
          >
            {isEmpty ? "○" : isExpanded ? "▼" : "▶"}
          </button>
          {name && <span className="json-key">{name}: </span>}
          <span className="json-bracket">{bracket[0]}</span>
          {!isExpanded && !isEmpty && (
            <span className="json-collapsed">...</span>
          )}
          {!isExpanded && <span className="json-bracket">{bracket[1]}</span>}
          {onDelete && !isRoot && (
            <button onClick={this.deleteThis} className="json-btn-delete">
              🗑
            </button>
          )}
          <button onClick={this.addProperty} className="json-btn-add">
            +
          </button>
        </div>

        {isExpanded && (
          <div className="json-node-children">
            {keys.map((key) => (
              <JsonNode
                key={key}
                name={key}
                data={data[key]}
                path={[...path, isArray ? Number(key) : key]}
                onChange={onChange}
                onDelete={(deletePath) => {
                  if (isArray) {
                    const newArray = [...data]
                    const index = deletePath[deletePath.length - 1]
                    newArray.splice(index, 1)
                    onChange(path, newArray)
                  } else {
                    const newObj = { ...data }
                    delete newObj[deletePath[deletePath.length - 1]]
                    onChange(path, newObj)
                  }
                }}
              />
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="json-node-footer">
            <span className="json-bracket">{bracket[1]}</span>
          </div>
        )}
      </div>
    )
  }
}

export default class JsonEditor extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
  }

  static defaultProps = {
    value: "",
    onChange: () => {},
    readOnly: false,
  }

  state = {
    data: {},
    error: null,
  }

  componentDidMount() {
    this.parseValue(this.props.value)
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.parseValue(this.props.value)
    }
  }

  parseValue(value) {
    try {
      const parsed = value ? JSON.parse(value) : {}
      this.setState({ data: parsed, error: null })
    } catch (e) {
      this.setState({ error: e.message })
    }
  }

  handleChange = (path, newValue) => {
    if (this.props.readOnly) return

    const newData = JSON.parse(JSON.stringify(this.state.data)) // Deep clone

    if (path.length === 0) {
      // Root change
      this.setState({ data: newValue }, () => {
        this.props.onChange(JSON.stringify(newValue, null, 2))
      })
      return
    }

    // Navigate to parent
    let current = newData
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }

    // Set the value
    current[path[path.length - 1]] = newValue

    this.setState({ data: newData }, () => {
      this.props.onChange(JSON.stringify(newData, null, 2))
    })
  }

  render() {
    const { error, data } = this.state

    if (error) {
      return (
        <div className="json-editor-error">
          <p>Invalid JSON: {error}</p>
          <pre>{this.props.value}</pre>
        </div>
      )
    }

    return (
      <div className="json-editor">
        <JsonNode
          data={data}
          path={[]}
          onChange={this.handleChange}
          isRoot
        />
      </div>
    )
  }
}
