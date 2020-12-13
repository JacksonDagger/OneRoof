exports.up = function(knex) {
    return knex.schema.createTable("division_roommate_join", (table) => {
        table.increments("division_roommate_join_id").notNullable();
        table.integer("division_roommate_join_division").unsigned().notNullable();
        table.foreign("division_roommate_join_division").references("divisions.division_id");
        table.integer("division_roommate_join_roommate").unsigned().notNullable();
        table.foreign("division_roommate_join_roommate").references("roommates.roommate_id");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("division_roommate_join");
};