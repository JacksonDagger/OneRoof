const e = require("express");

exports.up = function(knex) {
    return knex.schema.createTable("divisions", (table) => {
        table.increments("division_id").notNullable();
        table.integer("division_purchase").unsigned().notNullable();
        table.foreign("division_purchase").references("purchases.purchase_id");
        table.integer("division_amount").notNullable();
        table.string("division_memo");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("divisions");
};