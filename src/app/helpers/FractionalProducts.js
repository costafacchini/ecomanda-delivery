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
    if (this.licensee.productFractional2Id == id) return this.licensee.productFractional2Name
    if (this.licensee.productFractional3Id == id) return this.licensee.productFractional3Name
    if (this.licensee.productFractionalSize3Id == id) return this.licensee.productFractionalSize3Name
    if (this.licensee.productFractionalSize4Id == id) return this.licensee.productFractionalSize4Name
    return ''
  }

  createItemFull() {
    const product_retailer_id = this.fractionProductRetailerId
    const name = this.findProductNameByID(product_retailer_id)

    return {
      product_retailer_id: product_retailer_id,
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
      product_fb_id: item.product_fb_id,
    }
  }

  join(items) {
    const itemsTransformed = []

    items.forEach((item) => {
      if (item.name.includes('1/2') || item.name.includes('1/3')) {
        if (this.hasSomePartialItem()) {
          this.itemPartial.push(item)

          if (this.isPartialItemsFull()) {
            const itemComplete = this.createItemFull()

            this.itemPartial.forEach((item) => {
              const additional = this.createItemAdditional(item)

              this.fractionTotal = 0
              itemComplete.unit_price = itemComplete.unit_price + additional.unit_price
              itemComplete.additionals.push(additional)
            })

            itemsTransformed.push(itemComplete)
          }
        } else {
          this.fractionTotal = item.name.includes('1/2') ? 2 : 3
          this.fractionProductRetailerId = item.note.replace(/[^0-9]/g, '')
          this.itemPartial.push(item)
        }
      } else {
        itemsTransformed.push(item)
      }
    })

    return itemsTransformed
  }
}

module.exports = FractionalProducts
