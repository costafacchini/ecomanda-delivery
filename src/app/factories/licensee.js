const { Factory } = require('fishery')

const licensee = Factory.define(({ sequence }) => ({
  name: 'Alcateia Ltds',
  active: true,
  licenseKind: 'demo',
  apiToken: sequence,
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

const licenseeIntegrationPagarMe = Factory.define(() => ({
  name: 'Alcateia Ltds',
  email: 'alcateia@alcateia.com',
  kind: 'company',
  document: '18325187000169',
  active: true,
  licenseKind: 'demo',
  useChatbot: false,
  financial_player_fee: 3.1,
  holder_name: 'John Doe',
  bank: '001',
  branch_number: '123',
  branch_check_digit: '1',
  account_number: '123456',
  account_check_digit: '2',
  holder_kind: 'individual',
  holder_document: '86596393160',
  account_type: 'checking',
}))

module.exports = { licensee, licenseeComplete, licenseeIntegrationPagarMe }
