export function summarizeChange(current = '', previous = '') {
  const tokenize = (str) => str.trim().split(/\s+/)
  const currentWords = new Set(tokenize(current))
  const previousWords = new Set(tokenize(previous))

  let added = 0
  let deleted = 0

  for (const word of currentWords) {
    if (!previousWords.has(word)) added++
  }

  for (const word of previousWords) {
    if (!currentWords.has(word)) deleted++
  }

  return {
    '+': added,
    '-': deleted,
  }
}
