exports.up = function(knex) {
    return knex.schema.createTable("tokens", (table) => {
        table.string("token").notNullable();
        table.integer("roommate_id").unsigned().notNullable();
        table.foreign("roommate_id").references("roommates.roommate_id");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("tokens");
};

