module.exports = function swaggerSchemaHandler(schema){

  const obj = {
    attrValue: '',
    typeValue: schema.type,
    children: []
  }

  const { type, example } = schema
  if (['string', 'number', 'boolean'].includes(type)){
    if (example) obj.attrValue = schema.example
  } else if (type === 'array') {
    if (schema.items.type === 'string' && schema.items.example) obj.attrValue = schema.items.example
  } else if (type === 'object') {
    if (schema.properties) Object.keys(schema.properties).map(key => {
      const {attrValue, typeValue, children} = swaggerSchemaHandler(schema.properties[key])
      const child = {attr: key, attrValue, typeValue, children}
      obj.children.push(child)
    })
  }

  return obj
}

