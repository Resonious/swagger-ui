/**
 * @prettier
 */

/**
 * Simple case-insensitive substring match
 */
function contains(searchPhrase, targetString) {
  if (!searchPhrase || !targetString) return false
  return targetString.toLowerCase().includes(searchPhrase.toLowerCase())
}

/**
 * Filter operations using simple substring search
 * Searches operation paths, summaries, descriptions, operationIds, and tags
 */
export default function (taggedOps, phrase) {
  if (!phrase || phrase.trim() === "") {
    return taggedOps
  }

  const searchPhrase = phrase.trim()

  return taggedOps
    .map((tagObj, tag) => {
      // Each tagObj is a Map with { tagDetails, operations }
      const operations = tagObj.get("operations")

      // Search through operations in this tag
      const matchedOperations = operations.filter((op) => {
        const path = op.get("path") || ""
        const method = op.get("method") || ""
        const operation = op.get("operation")
        const summary = operation ? operation.get("summary") || "" : ""
        const description = operation ? operation.get("description") || "" : ""
        const operationId = operation ? operation.get("operationId") || "" : ""

        // Check if any field contains the search phrase
        return (
          contains(searchPhrase, path) ||
          contains(searchPhrase, summary) ||
          contains(searchPhrase, description) ||
          contains(searchPhrase, operationId) ||
          contains(searchPhrase, method) ||
          contains(searchPhrase, tag)
        )
      })

      // Return the tagObj with filtered operations
      return tagObj.set("operations", matchedOperations)
    })
    .filter((tagObj) => tagObj.get("operations").size > 0) // Remove tags with no matching operations
}
