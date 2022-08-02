const {
  createLambdaFunction,
  createProbot,
} = require('@probot/adapter-aws-lambda-serverless')
const app = require('../../lib')

module.exports.handler = createLambdaFunction(app, {
  probot: createProbot(),
})
