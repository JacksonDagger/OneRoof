exports.seed = (knex) => {
    return knex("divisions").del()
     .then(() => {
        return knex("divisions").insert([
          {"division_purchase": 1, "division_amount": 3000, "division_memo": "Something stupid"},
          {"division_purchase": 2, "division_amount": 500},
          {"division_purchase": 2, "division_amount": 500, "division_memo": "Something moronic"}
        ]);
      });
  };