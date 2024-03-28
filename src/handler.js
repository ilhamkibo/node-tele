const db = require("./config");
const { sendNotificationToAllUsers } = require("./index");

const addUserHandler = async (request, h) => {
  try {
    const { user_id, first_name, username } = request.payload;

    // Memasukkan data pengguna ke dalam tabel "users"
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (user_id, first_name, username) VALUES (?, ?, ?)",
        [user_id, first_name, username],
        function (err) {
          if (err) {
            reject(err);
          } else {
            // Mengirim pesan pemberitahuan ke seluruh member jika penambahan berhasil
            sendNotificationToAllUsers(
              `Selamat datang, ${first_name}! Ada pengguna baru di aplikasi kami.`
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
          }
        }
      );
    });

    const response = h.response({
      status: "success",
      message: "User added successfully",
    });
    response.code(201); // 201 Created
    return response;
  } catch (error) {
    const response = h.response({
      status: "fail",
      message: "Failed to add user",
      error: error.message,
    });
    response.code(500); // Internal Server Error
    return response;
  }
};

const getTemperatureRoomHandler = async (request, h) => {
  try {
    const temperatures = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM temperature", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (temperatures.length === 0) {
      const response = h.response({
        status: "Fail",
        Message: "Temperature value not found",
      });
      response.code(404);
      return response;
    }
    const response = h.response({
      status: "success",
      data: temperatures,
    });
    return response;
  } catch (error) {
    const response = h.response({
      status: "Error",
      message: "Internal server error",
    });
    response.code(500);
    return response;
  }
};

const getAllUsersHandler = async (request, h) => {
  try {
    // Mendapatkan semua pengguna dari tabel "users"
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (users.length === 0) {
      const response = h.response({
        status: "fail",
        message: "Users not found",
      });
      response.code(404);
      return response;
    }

    return {
      status: "success",
      data: users,
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Failed to fetch users",
      error: error.message,
    };
  }
};

const addTemperatureRoomHandler = async (request, h) => {
  try {
    const { room_id, temperature } = request.payload;

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO temperature (room_id, value) VALUES (?,?)",
        [room_id, temperature],
        (err) => {
          if (err) {
            reject(err);
          } else {
            if (temperature >= 90) {
              sendNotificationToAllUsers(
                `Terjadi peningkatan suhu yaitu sebesar ${temperature} pada room id: ${room_id}! Mohon segera tindak lanjuti.`
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
            } else {
              resolve(this.lastID);
            }
          }
        }
      );
    });

    const response = h.response({
      status: "success",
      message: "Value added successfully",
    });
    response.code(201);
    return response;
  } catch (error) {
    const response = h.response({
      status: "Fail",
      message: "Failed to add value",
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addUserHandler,
  getAllUsersHandler,
  addTemperatureRoomHandler,
  getTemperatureRoomHandler,
};
