const yaml = require('js-yaml')
const fs = require('fs')

const yamlString = fs.readFileSync('../assets/test.yaml')
const json = yaml.load(yamlString)

fs.writeFileSync('../assets/test.json', JSON.stringify(json))
console.log(json)