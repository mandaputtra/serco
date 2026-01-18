const checkMatch = (name, query, isRegex) => {
  if (!query) return true
  if (isRegex) {
    try {
      return new RegExp(query, 'i').test(name)
    } catch {
      return name.toLowerCase().includes(query.toLowerCase())
    }
  } else {
    return name === query
  }
}

console.log("Testing \.jpg$ on image.jpg")
console.log(checkMatch("image.jpg", "\.jpg$", true))

console.log("Testing \.jpg$ on image.png")
console.log(checkMatch("image.png", "\.jpg$", true))
