exports.seed = (knex) => {
  return knex("houses").del()
    .then(() => {
      return knex("houses").insert([
        {"house_name": "House 1", "house_admin": 1}
      ]);
    });
  };