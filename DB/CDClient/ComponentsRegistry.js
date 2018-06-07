const Sequelize = require('sequelize');

const ComponentsRegistry = CDClient.define('ComponentsRegistry', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    component_type: {
        type: Sequelize.INTEGER,
    },
    component_id: {
        type: Sequelize.INTEGER,
    }
}, {
    timestamps: false,
    tableName: 'ComponentsRegistry',
});

module.exports = ComponentsRegistry;