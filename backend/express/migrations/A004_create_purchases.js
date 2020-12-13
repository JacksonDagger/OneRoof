exports.up = function(knex) {
    return knex.schema.createTable("purchases", (table) => {
        table.increments("purchase_id").notNullable();
        table.integer("purchase_roommate").unsigned().notNullable();
        table.foreign("purchase_roommate").references("roommates.roommate_id");
        table.integer("purchase_amount").notNullable();
        table.string("purchase_memo");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("purchases");
};