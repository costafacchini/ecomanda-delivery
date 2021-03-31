db.createUser(
  {
    user: "root",
    pwd: "pwk372ew",
    roles: [
      {
        role: "readWrite",
        db: "ecomanda-delivery"
      }
    ]
  }
)