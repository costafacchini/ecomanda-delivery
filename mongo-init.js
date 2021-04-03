db.createUser(
  {
    user: "root",
    pwd: "pwk372ew",
    roles: [
      {
        role: "readWrite",
        db: "ecomanda-delivery"
      },
      {
        role: "readWrite",
        db: "ecomanda-delivery-test"
      }
    ]
  }
)