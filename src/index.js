const TelegramBot = require("node-telegram-bot-api");
const token = "7071965397:AAFUm8Qu1Kr9JqMAiwlxVPAStV-MMGI1mjE";
const db = require("./config");

const options = {
  polling: true,
};

const kibsbot = new TelegramBot(token, options);

const sendNotificationToAllUsers = async (message) => {
  try {
    // Mendapatkan semua user_id dari tabel "users"
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT user_id FROM users", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Mengirim pesan ke setiap user_id
    users.forEach((user) => {
      const user_id = user.user_id;
      kibsbot
        .sendMessage(user_id, message)
        .then(() => {
          console.log("Notification sent to user:", user_id);
        })
        .catch((error) => {
          console.error("Failed to send notification to user:", user_id, error);
        });
    });

    return {
      status: "success",
      message: "Notification sent to all users",
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Failed to send notification to all users",
      error: error.message,
    };
  }
};

kibsbot.on("message", (callback) => console.log(callback));

// Handler untuk menangani peristiwa bergabung dengan bot
kibsbot.on("new_chat_members", async (msg) => {
  const newMembers = msg.new_chat_members;
  console.log("🚀 ~ kibsbot.on ~ newMembers:", newMembers);

  newMembers.forEach(async (member) => {
    const { id, first_name, username } = member;

    try {
      // Simpan informasi pengguna ke dalam tabel "users"
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (user_id, first_name, username) VALUES (?, ?, ?)",
          [id, first_name, username],
          function (err) {
            if (err) {
              reject(err);
            } else {
              console.log("User added to database:", id);
              resolve(this.lastID);
            }
          }
        );
      });
    } catch (error) {
      console.error("Failed to add user to database:", error);
    }
  });
});

kibsbot.on("new_chat_members", (ctx) =>
  console.log(ctx.message.new_chat_members)
);

const prefix = "/";
const join = new RegExp(`^${prefix}join$`);

kibsbot.onText(join, async (callback) => {
  console.log("🚀 ~ kibsbot.onText ~ callback:", callback);
  const { id, first_name, username, last_name } = callback.from;
  const displayName = username || last_name;
  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE user_id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (existingUser) {
      console.log("User already exists in database:", id);
      kibsbot.sendMessage(
        callback.from.id,
        "Your account is already registered!"
      );
    } else {
      // Simpan informasi pengguna ke dalam tabel "users"
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (user_id, first_name, username) VALUES (?, ?, ?)",
          [id, first_name, displayName],
          function (err) {
            if (err) {
              reject(err);
            } else {
              console.log("User added to database:", id);
              kibsbot.sendMessage(
                callback.from.id,
                "Succesfully registered ur account! Welcome aboard to the Q-bot sect!"
              );
              sendNotificationToAllUsers(
                `Ucapkan selamat kepada ${first_name}! Yang baru saja bergabung dengan sekte Q-bot!`
              )
                .then(() => {
                  console.log("Notification sent to all users");
                  resolve(this.lastID);
                })
                .catch((error) => {
                  console.error(
                    "Failed to send notification to all users:",
                    error
                  );
                  resolve(this.lastID);
                });
              resolve(this.lastID);
            }
          }
        );
      });
    }
  } catch (error) {
    console.error("Failed to add user to database:", error);
  }
});

module.exports = { sendNotificationToAllUsers };
// kibsbot.on("message", (callback) => {
//   const id = callback.from.id;

//   kibsbot.sendMessage(id, "Ini kibo");
// });

// const prefix = ".";

// const sayHi = new RegExp(`^${prefix}halo$`);
// const gempa = new RegExp(`^${prefix}gempa$`);

// kibsbot.onText(sayHi, (callback) => {
//   kibsbot.sendMessage(callback.from.id, "halo juga");
// });

// kibsbot.onText(gempa, (callback) => {
//   kibsbot.sendMessage(callback.from.id, "Ini gempa");
// });
