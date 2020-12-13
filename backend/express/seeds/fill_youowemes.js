exports.seed = (knex) => {
    return knex("youowemes").del()
     .then(() => {
        return knex("youowemes").insert([
          {"youoweme_you": 1, "youoweme_me": 2, "youoweme_amount": 1000, "youoweme_create_date": new Date(), "youoweme_payed": true}
        ]);
      });
  };
