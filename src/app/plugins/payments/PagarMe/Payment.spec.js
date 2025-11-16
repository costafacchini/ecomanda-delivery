import { Payment } from './Payment.js'
import Integrationlog from '@models/Integrationlog'
import mongoServer from '../../../../../.jest/utils'
import { licenseeIntegrationPagarMe as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { CartRepositoryDatabase } from '@repositories/cart'
import request from '../../../services/request.js'

jest.mock('../../../services/request')

describe('PagarMe/Customer plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build({ recipient_id: '2313' }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createPIX', () => {
    describe('when success', () => {
      it('creates a order with payment PIX on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'pix',
              amount: 1610,
              pix: {
                expires_in: 1800,
                split: [
                  {
                    amount: 1560,
                    recipient_id: '2313',
                    type: 'flat',
                  },
                ],
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'or_56GXnk6T0eU88qMm',
              status: 'pending',
              charges: [
                {
                  id: 'ch_K2rJ5nlHwTE4qRDP',
                  status: 'pending',
                  last_transaction: {
                    id: 'tran_bZ0N3DjjUzTW68eq',
                    status: 'waiting_payment',
                    qr_code:
                      '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820 014BR.GOV.BCB.PIX2560sandbox-qrcode.stone.com.br/api/v2/qr/sGY7FyVExavqkzFvkQu MXA28580010BR.COM.ELO0104516002151234567890000000308933BB1100401P520400 00530398654041.005802BR5911STONE TESTE6009SAO PAULO62600522sGY7FyVExavqkzFvkQuMXA50300017BR.GOV.BCB.BRCODE01051.0.0 80500010BR.COM.ELO01100915132023020200030201040613202363043BA1',
                    qr_code_url: 'https://api.pagar.me/core/v1/transactions/tran_bZ0N3DjjUzTW68eq/qrcode.png',
                  },
                },
              ],
              checkouts: [],
            },
          },
        )

        const payment = new Payment()
        await payment.createPIX(cart, 'token')
        expect(consoleInfoSpy).toHaveBeenCalledWith('Pedido criado na pagar.me! id: or_56GXnk6T0eU88qMm log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the order and payment information', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'pix',
              amount: 1610,
              pix: {
                expires_in: 1800,
                split: [
                  {
                    amount: 1560,
                    recipient_id: '2313',
                    type: 'flat',
                  },
                ],
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'or_56GXnk6T0eU88qMm',
              code: 'YV3RCRIN24',
              amount: 1610,
              currency: 'BRL',
              closed: false,
              items: [
                {
                  id: 'oi_6rXqKEzuZYcRo2zL',
                  description: 'Product 1',
                  amount: 780,
                  quantity: 2,
                  status: 'active',
                },
              ],
              customer: {
                id: '1234',
                name: 'John Doe',
              },
              shipping: {
                amount: 50,
                recipient_name: 'John Doe',
                recipient_phone: '5511990283745',
                address: {
                  country: 'BR',
                  state: 'SP',
                  city: 'Sorocaba',
                  zip_code: '99876222',
                  line_1: `10, Rua qualquer da cidade, Bairro`,
                  line_2: 'Perto daquela parada lá',
                },
              },
              status: 'pending',
              location: {
                latitude: '-22.970722',
                longitude: '43.182365',
              },
              charges: [
                {
                  id: 'ch_K2rJ5nlHwTE4qRDP',
                  code: 'YV3RCRIN24',
                  gateway_id: '3b4bb2d9-19b3-4638-a974-0bb914fff472',
                  amount: 1610,
                  status: 'pending',
                  currency: 'BRL',
                  payment_method: 'Pix',
                  created_at: '2019-10-16T17:36:30Z',
                  updated_at: '2019-10-16T17:36:31Z',
                  customer: {
                    id: '1234',
                    name: 'John Doe',
                  },
                  last_transaction: {
                    id: 'tran_bZ0N3DjjUzTW68eq',
                    transaction_type: 'Pix',
                    gateway_id: '044581ea-67e8-4772-bd56-f10ade5499de',
                    amount: 1610,
                    status: 'waiting_payment',
                    success: true,
                    qr_code:
                      '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820 014BR.GOV.BCB.PIX2560sandbox-qrcode.stone.com.br/api/v2/qr/sGY7FyVExavqkzFvkQu MXA28580010BR.COM.ELO0104516002151234567890000000308933BB1100401P520400 00530398654041.005802BR5911STONE TESTE6009SAO PAULO62600522sGY7FyVExavqkzFvkQuMXA50300017BR.GOV.BCB.BRCODE01051.0.0 80500010BR.COM.ELO01100915132023020200030201040613202363043BA1',
                    qr_code_url: 'https://api.pagar.me/core/v1/transactions/tran_bZ0N3DjjUzTW68eq/qrcode.png',
                    expires_at: '2020-09-20T00:00:00Z',
                    created_at: '2019-10-16T17:36:30Z',
                    updated_at: '2019-10-16T17:36:30Z',
                    gateway_response: {},
                    antifraud_response: {},
                    metadata: {},
                  },
                },
              ],
              checkouts: [],
            },
          },
        )

        const payment = new Payment()
        await payment.createPIX(cart, 'token')
        const cartUpdated = await cartRepository.findFirst({ _id: cart._id })
        expect(cartUpdated.order_id).toEqual('or_56GXnk6T0eU88qMm')
        expect(cartUpdated.charge_id).toEqual('ch_K2rJ5nlHwTE4qRDP')
        expect(cartUpdated.pix_qrcode).toEqual(
          '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820 014BR.GOV.BCB.PIX2560sandbox-qrcode.stone.com.br/api/v2/qr/sGY7FyVExavqkzFvkQu MXA28580010BR.COM.ELO0104516002151234567890000000308933BB1100401P520400 00530398654041.005802BR5911STONE TESTE6009SAO PAULO62600522sGY7FyVExavqkzFvkQuMXA50300017BR.GOV.BCB.BRCODE01051.0.0 80500010BR.COM.ELO01100915132023020200030201040613202363043BA1',
        )
        expect(cartUpdated.pix_url).toEqual(
          'https://api.pagar.me/core/v1/transactions/tran_bZ0N3DjjUzTW68eq/qrcode.png',
        )
        expect(cartUpdated.payment_status).toEqual('waiting_payment')
        expect(cartUpdated.integration_status).toEqual('pending')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'pix',
              amount: 1610,
              pix: {
                expires_in: 1800,
                split: [
                  {
                    amount: 1560,
                    recipient_id: '2313',
                    type: 'flat',
                  },
                ],
              },
            },
          ],
        }

        const bodyResponse = {
          id: 'or_56GXnk6T0eU88qMm',
          status: 'pending',
          charges: [
            {
              id: 'ch_K2rJ5nlHwTE4qRDP',
              status: 'pending',
              last_transaction: {
                id: 'tran_bZ0N3DjjUzTW68eq',
                status: 'waiting_payment',
                qr_code:
                  '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820 014BR.GOV.BCB.PIX2560sandbox-qrcode.stone.com.br/api/v2/qr/sGY7FyVExavqkzFvkQu MXA28580010BR.COM.ELO0104516002151234567890000000308933BB1100401P520400 00530398654041.005802BR5911STONE TESTE6009SAO PAULO62600522sGY7FyVExavqkzFvkQuMXA50300017BR.GOV.BCB.BRCODE01051.0.0 80500010BR.COM.ELO01100915132023020200030201040613202363043BA1',
                qr_code_url: 'https://api.pagar.me/core/v1/transactions/tran_bZ0N3DjjUzTW68eq/qrcode.png',
              },
            },
          ],
          checkouts: [],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.createPIX(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'pix',
              amount: 1610,
              pix: {
                expires_in: 1800,
                split: [
                  {
                    amount: 1560,
                    recipient_id: '2313',
                    type: 'flat',
                  },
                ],
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: {
            message: 'The request is invalid.',
            errors: {
              'order.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const payment = new Payment()
        await payment.createPIX(cart, 'token')
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Pedido ${cart._id} não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"order.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'pix',
              amount: 1610,
              pix: {
                expires_in: 1800,
                split: [
                  {
                    amount: 1560,
                    recipient_id: '2313',
                    type: 'flat',
                  },
                ],
              },
            },
          ],
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'order.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.createPIX(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#createCreditCard', () => {
    describe('when success', () => {
      it('creates a order with payment Credit Card on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'credit_card',
              amount: 1610,
              credit_card: {
                recurrence: 'false',
                installments: 1,
                statement_descriptor: 'Alcateia Ltds',
                operation_type: 'auth_and_capture',
                card_id: 'card_3dlyaY6SPSb',
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'or_56GXnk6T0eU88qMm',
              status: 'pending',
              charges: [
                {
                  id: 'ch_p4lnAGyU0GT1E9MZ',
                  code: 'GP8KUL0B2D',
                  status: 'pending',
                  payment_method: 'credit_card',
                  funding_source: 'prepaid',
                  last_transaction: {
                    operation_key: '830608357',
                    id: 'tran_ywqNVaxiorcpde8W',
                    transaction_type: 'credit_card',
                    gateway_id: 'e98d2459-7b0e-43c1-b5e6-adea2c751427',
                    amount: 2990,
                    status: 'authorized_pending_capture',
                    success: true,
                    installments: 1,
                    funding_source: 'prepaid',
                    statement_descriptor: 'Alcateia Ltds',
                    acquirer_name: 'simulator',
                    acquirer_tid: '806863466',
                    acquirer_nsu: '66184',
                    acquirer_auth_code: '890',
                    acquirer_message: 'Transação autorizada com sucesso',
                    acquirer_return_code: '00',
                    operation_type: 'auth_only',
                    payment_type: 'PAN',
                    created_at: '2023-03-03T19:49:15Z',
                    updated_at: '2023-03-03T19:49:15Z',
                    gateway_response: {
                      code: '200',
                      errors: [],
                    },
                    antifraud_response: {},
                    metadata: {},
                  },
                },
              ],
              checkouts: [],
            },
          },
        )

        const payment = new Payment()
        await payment.createCreditCard(cart, 'token')
        expect(consoleInfoSpy).toHaveBeenCalledWith('Pedido criado na pagar.me! id: or_56GXnk6T0eU88qMm log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the order and payment information', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'credit_card',
              amount: 1610,
              credit_card: {
                recurrence: 'false',
                installments: 1,
                statement_descriptor: 'Alcateia Ltds',
                operation_type: 'auth_and_capture',
                card_id: 'card_3dlyaY6SPSb',
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'or_56GXnk6T0eU88qMm',
              code: 'YV3RCRIN24',
              amount: 1610,
              currency: 'BRL',
              closed: false,
              items: [
                {
                  id: 'oi_6rXqKEzuZYcRo2zL',
                  description: 'Product 1',
                  amount: 780,
                  quantity: 2,
                  status: 'active',
                },
              ],
              customer: {
                id: '1234',
                name: 'John Doe',
              },
              shipping: {
                amount: 50,
                recipient_name: 'John Doe',
                recipient_phone: '5511990283745',
                address: {
                  country: 'BR',
                  state: 'SP',
                  city: 'Sorocaba',
                  zip_code: '99876222',
                  line_1: `10, Rua qualquer da cidade, Bairro`,
                  line_2: 'Perto daquela parada lá',
                },
              },
              status: 'pending',
              location: {
                latitude: '-22.970722',
                longitude: '43.182365',
              },
              charges: [
                {
                  id: 'ch_p4lnAGyU0GT1E9MZ',
                  code: 'GP8KUL0B2D',
                  status: 'pending',
                  payment_method: 'credit_card',
                  funding_source: 'prepaid',
                  last_transaction: {
                    operation_key: '830608357',
                    id: 'tran_ywqNVaxiorcpde8W',
                    transaction_type: 'credit_card',
                    gateway_id: 'e98d2459-7b0e-43c1-b5e6-adea2c751427',
                    amount: 2990,
                    status: 'authorized_pending_capture',
                    success: true,
                    installments: 1,
                    funding_source: 'prepaid',
                    statement_descriptor: 'Alcateia Ltds',
                    acquirer_name: 'simulator',
                    acquirer_tid: '806863466',
                    acquirer_nsu: '66184',
                    acquirer_auth_code: '890',
                    acquirer_message: 'Transação autorizada com sucesso',
                    acquirer_return_code: '00',
                    operation_type: 'auth_only',
                    payment_type: 'PAN',
                    created_at: '2023-03-03T19:49:15Z',
                    updated_at: '2023-03-03T19:49:15Z',
                    gateway_response: {
                      code: '200',
                      errors: [],
                    },
                    antifraud_response: {},
                    metadata: {},
                  },
                },
              ],
              checkouts: [],
            },
          },
        )

        const payment = new Payment()
        await payment.createCreditCard(cart, 'token')
        const cartUpdated = await cartRepository.findFirst({ _id: cart._id })
        expect(cartUpdated.order_id).toEqual('or_56GXnk6T0eU88qMm')
        expect(cartUpdated.charge_id).toEqual('ch_p4lnAGyU0GT1E9MZ')
        expect(cartUpdated.operation_key).toEqual('830608357')
        expect(cartUpdated.operation_id).toEqual('tran_ywqNVaxiorcpde8W')
        expect(cartUpdated.gateway_id).toEqual('e98d2459-7b0e-43c1-b5e6-adea2c751427')
        expect(cartUpdated.gateway_response_code).toEqual('200')
        expect(cartUpdated.payment_status).toEqual('authorized_pending_capture')
        expect(cartUpdated.integration_status).toEqual('pending')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'credit_card',
              amount: 1610,
              credit_card: {
                recurrence: 'false',
                installments: 1,
                statement_descriptor: 'Alcateia Ltds',
                operation_type: 'auth_and_capture',
                card_id: 'card_3dlyaY6SPSb',
              },
            },
          ],
        }

        const bodyResponse = {
          id: 'or_56GXnk6T0eU88qMm',
          status: 'pending',
          charges: [
            {
              id: 'ch_p4lnAGyU0GT1E9MZ',
              code: 'GP8KUL0B2D',
              status: 'pending',
              payment_method: 'credit_card',
              funding_source: 'prepaid',
              last_transaction: {
                operation_key: '830608357',
                id: 'tran_ywqNVaxiorcpde8W',
                transaction_type: 'credit_card',
                gateway_id: 'e98d2459-7b0e-43c1-b5e6-adea2c751427',
                amount: 2990,
                status: 'authorized_pending_capture',
                success: true,
                installments: 1,
                funding_source: 'prepaid',
                statement_descriptor: 'Alcateia Ltds',
                acquirer_name: 'simulator',
                acquirer_tid: '806863466',
                acquirer_nsu: '66184',
                acquirer_auth_code: '890',
                acquirer_message: 'Transação autorizada com sucesso',
                acquirer_return_code: '00',
                operation_type: 'auth_only',
                payment_type: 'PAN',
                created_at: '2023-03-03T19:49:15Z',
                updated_at: '2023-03-03T19:49:15Z',
                gateway_response: {
                  code: '200',
                  errors: [],
                },
              },
            },
          ],
          checkouts: [],
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.createCreditCard(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'credit_card',
              amount: 1610,
              credit_card: {
                recurrence: 'false',
                installments: 1,
                statement_descriptor: 'Alcateia Ltds',
                operation_type: 'auth_and_capture',
                card_id: 'card_3dlyaY6SPSb',
              },
            },
          ],
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: {
            message: 'The request is invalid.',
            errors: {
              'order.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const payment = new Payment()
        await payment.createCreditCard(cart, 'token')
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Pedido ${cart._id} não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"order.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
          }),
        )

        const expectedBody = {
          customer_id: '1234',
          items: [
            {
              amount: 780,
              description: 'Product 1',
              quantity: 2,
              code: '0123',
            },
          ],
          shipping: {
            amount: 50,
            recipient_name: 'John Doe',
            recipient_phone: '5511990283745',
            address: {
              country: 'BR',
              state: 'SP',
              city: 'Sorocaba',
              zip_code: '99876222',
              line_1: `10, Rua qualquer da cidade, Bairro`,
              line_2: 'Perto daquela parada lá',
            },
          },
          payments: [
            {
              payment_method: 'credit_card',
              amount: 1610,
              credit_card: {
                recurrence: 'false',
                installments: 1,
                statement_descriptor: 'Alcateia Ltds',
                operation_type: 'auth_and_capture',
                card_id: 'card_3dlyaY6SPSb',
              },
            },
          ],
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'order.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.createCreditCard(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#delete', () => {
    describe('when success', () => {
      it('cancels a charge on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
            charge_id: 'charge-id',
          }),
        )

        request.delete.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'ch_56GXnk6T0eU88qMm',
              status: 'canceled',
            },
          },
        )

        const payment = new Payment()
        await payment.delete(cart, 'token')
        expect(consoleInfoSpy).toHaveBeenCalledWith('Pagamento cancelado na pagar.me! id: charge-id log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the order and payment information', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
            charge_id: 'charge-id',
          }),
        )

        request.delete.mockResolvedValueOnce({
          status: 200,
          data: {
              id: 'ch_56GXnk6T0eU88qMm',
              status: 'canceled',
            },
          },
        )

        const payment = new Payment()
        await payment.delete(cart, 'token')
        const cartUpdated = await cartRepository.findFirst({ _id: cart._id })
        expect(cartUpdated.payment_status).toEqual('voided')
        expect(cartUpdated.concluded).toEqual(true)

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
            charge_id: 'charge-id',
          }),
        )

        const bodyResponse = {
          id: 'ch_56GXnk6T0eU88qMm',
          status: 'canceled',
        }

        request.delete.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.delete(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
            charge_id: 'charge-id',
          }),
        )

        request.delete.mockResolvedValueOnce({
          status: 422,
          data: {
            message: 'The request is invalid.',
            errors: {
              'charge.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const payment = new Payment()
        await payment.delete(cart, 'token')
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Pagamento ${cart._id} não cancelado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"charge.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '1234',
            name: 'John Doe',
            number: '5511990283745',
            licensee,
          }),
        )

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(
          cartFactory.build({
            products: [
              {
                product_retailer_id: '0123',
                product_fb_id: 'fb_id',
                name: 'Product 1',
                quantity: 2,
                unit_price: 7.8,
                note: 'item note',
              },
            ],
            delivery_tax: 0.5,
            contact,
            licensee,
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            total: 16.1,
            charge_id: 'charge-id',
          }),
        )

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'charge.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        request.delete.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const payment = new Payment()
        await payment.delete(cart, 'token')
        const integrationlog = await Integrationlog.findOne({ cart: cart._id })
        expect(integrationlog.licensee._id).toEqual(cart.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
