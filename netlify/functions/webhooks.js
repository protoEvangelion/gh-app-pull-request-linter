// const {
//   createLambdaFunction,
//   createProbot,
// } = require('@probot/adapter-aws-lambda-serverless')
// const app = require('../../lib')

// module.exports.handler = createLambdaFunction(app, {
//   probot: createProbot(),
// })

module.exports.webhooks = function(event, context, callback) {
  console.log('YOOOO!!!')
  callback(null, {
      statusCode: 200, 
      body: JSON.stringify({ hey: 'world' })
  })
};
