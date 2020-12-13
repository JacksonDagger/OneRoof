exports.up = function(knex) {
    return knex.schema.createTable("roommates", (table) => {
        table.increments("roommate_id").notNullable();
        table.string("roommate_name");
        table.string("roommate_uid");
        table.boolean("roommate_is_site_admin").default(false);
        table.integer("roommate_budget").unsigned();
        table.integer("roommate_house").unsigned();
        table.foreign("roommate_house").references("houses.house_id");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("roommates");
};