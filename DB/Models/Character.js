const Sequelize = require('sequelize');

const Character = sequelize.define('character', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    unapproved_name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    shirt_color: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    shirt_style: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    pants_color: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    hair_style: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    hair_color: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    lh: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    rh: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    eyebrows: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    eyes: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    mouth: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    zone: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    instance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    clone: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    last_log: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: 0,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Character.sync({force: rebuildDB}).then(() => {
    // Table loaded
    console.log("Character Table Loaded");
});


module.exports = Character;