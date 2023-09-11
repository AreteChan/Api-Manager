const ApiModel = require('../models/apiModel')
const Project = require('../models/projectModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const swaggerSchemaHandler = require('../utils/swaggerSchemaHandler')

const createApi = catchAsync(async (req, res, next) => {
  req.body.creator = req.user._id
  req.body.updater = req.user._id
  req.body.project = req.params.id

  // 权限检测
  const project = await Project.findById(req.body.project)
  console.log(project)
  project.excludedMembers.forEach(id => { 
    if(String(id) === String(req.body.creator)) return next(new AppError("You don't have permission to perform this action", 403))
  })

  const api = await ApiModel.create(req.body)

  res.status(201).json({
    status: 'success',
    api
  })
})

exports.getApis = catchAsync(async (req, res, next) => {
  const apis = await ApiModel.find({ project: req.params.id })

  res.status(200).json({
    status: 'success',
    results: apis.length,
    apis
  });
})

exports.getApiDetail = catchAsync(async (req, res, next) => {
  const api = await ApiModel.findById(req.params.id)

  if (!api) {
    return next(new AppError('API not found', 404));
  }
  res.status(200).json({
    status: 'success',
    results: api.length,
    api
  })
})

exports.deleteApi = catchAsync(async (req, res, next) => {
  const deletedApi = await ApiModel.findByIdAndDelete(req.params.id);

  if (!deletedApi) {
    return next(new AppError('API not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `${deletedApi.name} delete successfully!` 
  });
})

exports.updateApi = catchAsync(async (req, res, next) => {
  req.body.updater = req.user._id

  const updatedApi = await ApiModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!updatedApi) return next(new AppError('API not found', 404))

  res.status(200).json({
    status: 'success',
    api: updatedApi
  })
})

exports.swaggerHandler = catchAsync(async (req, res, next) => {

  let paths = req.body.paths
  let apibody = {}
  let apibodys = []

  Object.keys(paths).map(path => {    // path: /url
    console.log('paths')
    let methods = paths[path]
    Object.keys(methods).map(method => {  // method: get

      console.log('methods')
      let api = methods[method]
      let tag = api.tags[0]
      console.log(api, api.tags)
      let summary = api.summary
      let description = api.description
      let parameters = api.parameters    // paramters array
      let responses = api.responses      // responses object

      let params = [], query = [], body = [], response = []

      parameters && parameters.map(parameter => {
        console.log('paramters')
        
        let { in:inn, name, description, schema } = parameter

        let {attrValue, typeValue, children} = swaggerSchemaHandler(schema)


        let bodySchema = {  // attr, attrValue, typeValue, summary, children
          attr: name,
          attrValue,
          summary: description,
          typeValue,
          children
        }

        if (inn === 'path') {
          params.push(bodySchema)
        } else if (inn === 'query') {
          query.push(bodySchema)
        } else if (inn === 'body') {
          body.push(bodySchema)
        }
      })

      responses && Object.keys(responses).map(statusCode => {
        console.log('responses')

        let body
        let { description, schema } = responses[statusCode]
        let obj = swaggerSchemaHandler(schema) 
        if (obj.typeValue === 'object') body = obj.children

        let responseSchema = {
          statusCode,
          summary: description,
          body
        }

        response.push(responseSchema)
      })

      apibody = {
        group: 'swagger 分组',
        name: tag,
        summary,
        description,
        path,
        method,
        params,
        query,
        body,
        response
      }

      apibodys.push(apibody)

      req.body = apibody

      createApi(req, res, next)
    })
    
  })


  // console.log(req.body)

  // res.status(200).json({
  //   status: 'success',
  //   apibodys
  // })

})

exports.createApi = createApi