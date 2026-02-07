import React from "react"
import PropTypes from "prop-types"

export default class FilterContainer extends React.Component {

  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
  }

  onFilterChange = (e) => {
    const {target: {value}} = e
    this.props.layoutActions.updateFilter(value)
  }

  render () {
    // Filter is now in the TopBar, so this component returns nothing
    return null
  }
}
