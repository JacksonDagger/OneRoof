exports.up = function(knex) {
    return knex.schema.createTable("youowemes", (table) => {
        table.increments("youoweme_id").notNullable();
        table.integer("youoweme_you").unsigned().notNullable();
        table.foreign("youoweme_you").references("roommates.roommate_id");
        table.integer("youoweme_me").unsigned().notNullable();
        table.foreign("youoweme_me").references("roommates.roommate_id");
        table.integer("youoweme_amount").notNullable();
        table.date("youoweme_create_date").notNullable();
        table.boolean("youoweme_payed").default(false);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("youowemes");
};