class FractionalProducts {
  constructor(licensee) {
    this.licensee = licensee
    this.fractionTotal = 0
    this.itemPartial = []
  }

  hasSomePartialItem() {
    return this.itemPartial.length > 0
  }

  isPartialItemsFull() {
    return this.itemPartial.length == this.fractionTotal
  }

  createItemFull() {
    const product_retailer_id =
      this.fractionTotal === 2 ? this.licensee.productFractional2Id : this.licensee.productFractional3Id
    const name = this.fractionTotal === 2 ? this.licensee.productFractional2Name : this.licensee.productFractional3Name

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
