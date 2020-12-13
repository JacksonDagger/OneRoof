exports.up = function(knex) {
    return knex.schema.createTable("houses", (table) => {
        table.increments("house_id").notNullable();
        table.string("house_name").notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("houses");
};

