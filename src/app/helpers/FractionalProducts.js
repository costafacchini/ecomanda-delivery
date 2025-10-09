class FractionalProducts {
  constructor(licensee) {
    this.licensee = licensee
    this.fractionTotal = 0
    this.fractionProductRetailerId = 0
    this.itemPartial = []
  }

  hasSomePartialItem() {
    return this.itemPartial.length > 0
  }

  isPartialItemsFull() {
    return this.itemPartial.length == this.fractionTotal
  }

  findProductNameByID(id) {
    if (!this.licensee.productFractionals) return ''

    try {
      const productFrationals = JSON.parse(this.licensee.productFractionals)
      const productFractional = productFrationals.products.find((product) => product.id == id)

      return productFractional.name
    } catch {
      return ''
    }
  }

  createItemFull(productRetaileId) {
    const name = this.findProductNameByID(productRetaileId)

    return {
      product_retailer_id: productRetaileId,
      name: name,
      quantity: 1,
      unit_price: 0,
      note: '',
      product_fb_id: '',
      additionals: [],
    }
  }

  createItemAdditional(item) {
    return {
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      note: item.note,
      product_retailer_id: item.product_retailer_id,
      product_fb_id: item.product_fb_id || '',
    }
  }

  hasIdOnNote(item) {
    const indexOfIdentifier = item.note && item.note.indexOf('#')
    if (!indexOfIdentifier || indexOfIdentifier < 0) return false

    const expression = item.note.substring(indexOfIdentifier)

    return expression.replace(/[^0-9]/g, '') != ''
  }

  getItemIdFromNote(note) {
    return note.replace(/[^0-9]/g, '')
  }

  join(items) {
    const itemsTransformed = []

    items.forEach((item) => {
      if (item.name.includes('1/')) {
        if (this.hasSomePartialItem()) {
          this.itemPartial.push(item)

          if (this.isPartialItemsFull()) {
            const itemComplete = this.createItemFull(this.fractionProductRetailerId)

            this.itemPartial.forEach((item) => {
              const additional = this.createItemAdditional(item)

              this.fractionTotal = 0
              itemComplete.unit_price = itemComplete.unit_price + additional.unit_price
              itemComplete.additionals.push(additional)
            })

            itemsTransformed.push(itemComplete)
          }
        } else {
          if (item.name.includes('1/2')) this.fractionTotal = 2
          if (item.name.includes('1/3')) this.fractionTotal = 3
          if (item.name.includes('1/4')) this.fractionTotal = 4
          this.fractionProductRetailerId = this.getItemIdFromNote(item.note)
          this.itemPartial.push(item)
        }
      } else {
        if (this.hasIdOnNote(item)) {
          const productRetailerId = this.getItemIdFromNote(item.note)

          const mainItem = this.createItemFull(productRetailerId)
          mainItem.quantity = item.quantity
          mainItem.unit_price = item.unit_price

          const additional = this.createItemAdditional(item)
          mainItem.additionals.push(additional)

          itemsTransformed.push(mainItem)
        } else {
          // path mais simples onde devolve o item de forma original
          itemsTransformed.push(item)
        }
      }
    })

    return itemsTransformed
  }
}

export default FractionalProducts
