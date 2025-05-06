function compareNestedJson(json1, json2) {
  const diffPaths = []

  function compareObjects(obj1, obj2, path = "") {
    for (let key of Object.keys(obj1)) {
      if (!same(obj1[key], obj2[key])) {
        if (
          typeof obj1[key] === "object" &&
          typeof obj2[key] === "object"
        ) {
          compareObjects(obj1[key], obj2[key], `${path}.${key}`)
        } else diffPaths.push(`${path}.${key}`)
      } else {
        if (
          typeof obj1[key] === "object" &&
          typeof obj2[key] === "object"
        ) {
          compareObjects(obj1[key], obj2[key], `${path}.${key}`)
        }
      }
    }
  }
  compareObjects(json1, json2)

  function same(x, y) {
    return JSON.stringify(x) === JSON.stringify(y)
  }
  return diffPaths
}

// Example usage
const json1 = [{ z: "test" }]

const json2 = [{ z: "test" }]

console.log(compareNestedJson(json1, json2)) // Output: ['[] added key []']
