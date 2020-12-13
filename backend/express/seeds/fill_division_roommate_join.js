exports.seed = (knex) => {
    return knex("division_roommate_join").del()
     .then(() => {
        return knex("division_roommate_join").insert([
          {"division_roommate_join_division": 1, "division_roommate_join_roommate": 1},
          {"division_roommate_join_division": 1, "division_roommate_join_roommate": 2},
          {"division_roommate_join_division": 2, "division_roommate_join_roommate": 1},
          {"division_roommate_join_division": 2, "division_roommate_join_roommate": 2},
          {"division_roommate_join_division": 3, "division_roommate_join_roommate": 2}
        ]);
      });
  };