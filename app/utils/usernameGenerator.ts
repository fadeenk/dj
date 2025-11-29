const adjectives = ['Quick', 'Lazy', 'Funny', 'Serious', 'Clever', 'Crazy', 'Sleepy']
const nouns = ['Rabbit', 'Turtle', 'Cat', 'Dog', 'Mouse', 'Elephant', 'Giraffe', 'Lion', 'Tiger', 'Bear', 'Panda', 'Monkey', 'Penguin']

export function generateUsername() {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${randomAdjective} ${randomNoun}`
}
