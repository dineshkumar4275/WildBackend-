const prisma = require("../prisma");

exports.registerDevice = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      expoPushToken,
      platform,
    } = req.body;

    if (
      !expoPushToken ||
      typeof expoPushToken !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Expo push token is required",
      });
    }

    const cleanPlatform =
      platform
        ? platform.toLowerCase()
        : null;

    if (
      cleanPlatform &&
      !["android", "ios"].includes(cleanPlatform)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Platform must be android or ios",
      });
    }

    const device =
      await prisma.user_devices.upsert({
        where: {
          user_id_expo_push_token: {
            user_id: userId,
            expo_push_token:
              expoPushToken,
          },
        },

        update: {
          platform: cleanPlatform,
        },

        create: {
          user_id: userId,
          expo_push_token:
            expoPushToken,
          platform: cleanPlatform,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Device registered successfully",

      device: {
        id: device.id,
        user_id: device.user_id,
        expo_push_token:
          device.expo_push_token,
        platform: device.platform,
        created_at:
          device.created_at,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER DEVICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to register device",
    });
  }
};