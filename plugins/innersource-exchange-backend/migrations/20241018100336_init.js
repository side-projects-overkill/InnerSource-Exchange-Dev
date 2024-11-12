/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('projects', table => {
    table.text('id').comment('Id of each project').notNullable().primary();
    table.text('name').nullable().comment('Name of project');
    table.text('project_data').comment('Project data in json form');
  });

  await knex.schema.createTable('skills', table => {
    table.text('id').notNullable();
    table.text('name').unique().notNullable();
    table.text('color').notNullable().defaultTo('#333');
    table.text('type');
    table.text('users').defaultTo('[]');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('projects');
  await knex.schema.dropTable('skills');
};
