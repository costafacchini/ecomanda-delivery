const { Factory } = require('fishery')

const licensee = Factory.define(() => ({
  name: 'Alcateia Ltds',
  active: true,
  licenseKind: 'demo',
}))

const licenseeComplete = Factory.define(() => ({
  name: 'Alcateia Ltds',
  email: 'alcateia@alcateia.com',
  phone: '11098538273',
  active: true,
  licenseKind: 'demo',
  useChatbot: true,
  chatbotDefault: 'landbot',
  whatsappDefault: 'dialog',
  chatDefault: 'rocketchat',
  chatbotUrl: 'https://chatbot.url',
  chatbotAuthorizationToken: 'chat-bot-token',
  whatsappToken: 'whatsapp-token',
  whatsappUrl: 'https://whatsapp.url',
  chatUrl: 'https://chat.url',
  awsId: 'aws-id',
  awsSecret: 'aws-secret',
  bucketName: 'bocket-name',
}))

module.exports = { licensee, licenseeComplete }
