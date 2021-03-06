const TABLE = "teamMembers";

module.exports = {
  up: async function (migration, DataTypes) {
    await migration.createTable(TABLE, {
      guid: {
        type: DataTypes.STRING(40),
        primaryKey: true,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      teamGuid: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },

      firstName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      lastName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      email: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await migration.addIndex(TABLE, ["email"], {
      unique: true,
      fields: ["email"],
    });

    await migration.addIndex(TABLE, ["teamGuid"], {
      fields: ["teamGuid"],
    });
  },

  down: async function (migration) {
    await migration.dropTable(TABLE);
  },
};
