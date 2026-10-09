
// const prisma = require("../prisma");

// // ==========================================
// // UUID VALIDATION
// // No extra package required
// // ==========================================

// const isUuid = (value) => {
//   if (typeof value !== "string") {
//     return false;
//   }

//   return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
//     value
//   );
// };

// // ==========================================
// // GET ALL LISTINGS
// // GET /api/listings
// // ==========================================

// exports.getAll = async (req, res) => {
//   try {
//     const { category, breed, q, location } = req.query;

//     const where = {
//       status: "ACTIVE",
//     };

//     // ==========================================
//     // CATEGORY FILTER
//     // ==========================================

//     if (category && category !== "all") {
//       where.category = {
//         name: {
//           equals: category,
//           mode: "insensitive",
//         },
//       };
//     }

//     // ==========================================
//     // BREED FILTER
//     // ==========================================

//     if (breed && breed !== "all") {
//       where.breed = {
//         name: {
//           equals: breed,
//           mode: "insensitive",
//         },
//       };
//     }

//     // ==========================================
//     // LOCATION SEARCH
//     // ==========================================

//     if (location) {
//       where.OR = [
//         {
//           city: {
//             contains: location,
//             mode: "insensitive",
//           },
//         },
//         {
//           area: {
//             contains: location,
//             mode: "insensitive",
//           },
//         },
//         {
//           district: {
//             contains: location,
//             mode: "insensitive",
//           },
//         },
//         {
//           state: {
//             contains: location,
//             mode: "insensitive",
//           },
//         },
//       ];
//     }

//     // ==========================================
//     // GENERAL SEARCH
//     // ==========================================

//     if (q) {
//       const searchConditions = [
//         {
//           title: {
//             contains: q,
//             mode: "insensitive",
//           },
//         },
//         {
//           description: {
//             contains: q,
//             mode: "insensitive",
//           },
//         },
//         {
//           colour: {
//             contains: q,
//             mode: "insensitive",
//           },
//         },
//         {
//           breed: {
//             name: {
//               contains: q,
//               mode: "insensitive",
//             },
//           },
//         },
//         {
//           category: {
//             name: {
//               contains: q,
//               mode: "insensitive",
//             },
//           },
//         },
//       ];

//       if (where.OR) {
//         const locationConditions = where.OR;

//         delete where.OR;

//         where.AND = [
//           {
//             OR: locationConditions,
//           },
//           {
//             OR: searchConditions,
//           },
//         ];
//       } else {
//         where.OR = searchConditions;
//       }
//     }

//     // ==========================================
//     // FETCH LISTINGS
//     // ==========================================

//     const listings = await prisma.listings.findMany({
//       where,

//       orderBy: {
//         created_at: "desc",
//       },

//       include: {
//         category: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },

//         breed: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },

//         images: {
//           orderBy: {
//             sort_order: "asc",
//           },
//         },

//         seller: {
//           select: {
//             id: true,
//             name: true,
//             full_name: true,
//             city: true,
//             district: true,
//           },
//         },
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       count: listings.length,
//       listings,
//     });
//   } catch (error) {
//     console.error("[GET ALL LISTINGS ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch listings",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // GET NEARBY LISTINGS
// // GET /api/listings/nearby
// // ==========================================

// exports.nearby = async (req, res) => {
//   try {
//     const latitude = Number(req.query.latitude);
//     const longitude = Number(req.query.longitude);
//     const radius = Number(req.query.radius || 100);

//     console.log("=================================");
//     console.log("🐄 NEARBY LISTINGS REQUEST");
//     console.log("Latitude:", latitude);
//     console.log("Longitude:", longitude);
//     console.log("Radius:", radius, "km");
//     console.log("=================================");

//     // ==========================================
//     // VALIDATION
//     // ==========================================

//     if (!Number.isFinite(latitude)) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid latitude is required",
//       });
//     }

//     if (!Number.isFinite(longitude)) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid longitude is required",
//       });
//     }

//     if (latitude < -90 || latitude > 90) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid latitude",
//       });
//     }

//     if (longitude < -180 || longitude > 180) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid longitude",
//       });
//     }

//     if (!Number.isFinite(radius) || radius <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid radius",
//       });
//     }

//     // Maximum radius = 100 KM
//     const safeRadius = Math.min(radius, 100);

//     // ==========================================
//     // HAVERSINE QUERY
//     // ==========================================

//     const listings = await prisma.$queryRaw`
//       SELECT
//         l.id AS listing_id,
//         l.title,
//         l.description,
//         l.price,
//         l.negotiable,
//         l.status,
//         l.created_at,

//         l.gender,
//         l.age,
//         l.weight,
//         l.colour,

//         ac.id AS category_id,
//         ac.name AS category_name,

//         ab.id AS breed_id,
//         ab.name AS breed_name,

//         l.area,
//         l.city,
//         l.district,
//         l.state,

//         (
//           6371 * acos(
//             LEAST(
//               1,
//               GREATEST(
//                 -1,

//                 cos(radians(${latitude}))
//                 *
//                 cos(radians(l.latitude))
//                 *
//                 cos(
//                   radians(l.longitude)
//                   -
//                   radians(${longitude})
//                 )
//                 +
//                 sin(radians(${latitude}))
//                 *
//                 sin(radians(l.latitude))
//               )
//             )
//           )
//         ) AS distance_km

//       FROM listings l

//       LEFT JOIN animal_categories ac
//         ON ac.id = l.category_id

//       LEFT JOIN animal_breeds ab
//         ON ab.id = l.breed_id

//       WHERE
//         l.status = 'ACTIVE'

//         AND l.latitude IS NOT NULL
//         AND l.longitude IS NOT NULL

//         AND (
//           6371 * acos(
//             LEAST(
//               1,
//               GREATEST(
//                 -1,

//                 cos(radians(${latitude}))
//                 *
//                 cos(radians(l.latitude))
//                 *
//                 cos(
//                   radians(l.longitude)
//                   -
//                   radians(${longitude})
//                 )
//                 +
//                 sin(radians(${latitude}))
//                 *
//                 sin(radians(l.latitude))
//               )
//             )
//           )
//         ) <= ${safeRadius}

//       ORDER BY distance_km ASC
//     `;

//     // ==========================================
//     // FORMAT RESPONSE
//     // ==========================================

//     const formattedListings = listings.map((item) => ({
//       listing_id: item.listing_id,

//       title: item.title,

//       description: item.description,

//       price:
//         item.price !== null &&
//         item.price !== undefined
//           ? Number(item.price)
//           : 0,

//       negotiable: item.negotiable,

//       status: item.status,

//       created_at: item.created_at,

//       gender: item.gender,

//       age: item.age,

//       weight:
//         item.weight !== null &&
//         item.weight !== undefined
//           ? Number(item.weight)
//           : null,

//       colour: item.colour,

//       category_id: item.category_id,

//       category_name: item.category_name,

//       breed_id: item.breed_id,

//       breed_name: item.breed_name,

//       area: item.area,

//       city: item.city,

//       district: item.district,

//       state: item.state,

//       distance_km:
//         item.distance_km !== null &&
//         item.distance_km !== undefined
//           ? Number(Number(item.distance_km).toFixed(2))
//           : null,
//     }));

//     console.log(
//       "🐄 NEARBY LISTINGS FOUND:",
//       formattedListings.length
//     );

//     return res.status(200).json({
//       success: true,
//       count: formattedListings.length,
//       radius_km: safeRadius,
//       listings: formattedListings,
//     });
//   } catch (error) {
//     console.error("[NEARBY LISTINGS ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch nearby listings",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // GET SINGLE LISTING
// // GET /api/listings/:id
// // ==========================================

// exports.getOne = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("=================================");
//     console.log("🔎 GET ONE LISTING");
//     console.log("LISTING ID:", id);
//     console.log("=================================");

//     // ==========================================
//     // UUID VALIDATION
//     // ==========================================

//     if (!id || !isUuid(id)) {
//       console.log("❌ INVALID LISTING UUID:", id);

//       return res.status(400).json({
//         success: false,
//         error: "Invalid listing ID",
//       });
//     }

//     // ==========================================
//     // FIND LISTING
//     // ==========================================

//     const listing = await prisma.listings.findUnique({
//       where: {
//         id,
//       },

//       include: {
//         category: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },

//         breed: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },

//         images: {
//           orderBy: {
//             sort_order: "asc",
//           },
//         },

//         seller: {
//           select: {
//             id: true,
//             name: true,
//             full_name: true,
//             city: true,
//             district: true,
//           },
//         },
//       },
//     });

//     // ==========================================
//     // NOT FOUND
//     // ==========================================

//     if (!listing) {
//       return res.status(404).json({
//         success: false,
//         error: "Listing not found",
//       });
//     }

//     // ==========================================
//     // ONLY ACTIVE LISTINGS PUBLICLY
//     //
//     // Owner can see own listing.
//     // Admin can see all.
//     // ==========================================

//     const isOwner =
//       req.user &&
//       Number(req.user.id) === Number(listing.seller_id);

//     const isAdmin =
//       req.user &&
//       String(req.user.role || "").toUpperCase() === "ADMIN";

//     if (
//       listing.status !== "ACTIVE" &&
//       !isOwner &&
//       !isAdmin
//     ) {
//       return res.status(404).json({
//         success: false,
//         error: "Listing not found",
//       });
//     }

//     // ==========================================
//     // RESPONSE
//     //
//     // Exact latitude/longitude are intentionally
//     // NOT returned.
//     // ==========================================

//     return res.status(200).json({
//       success: true,
//       listing: {
//         ...listing,

//         price:
//           listing.price !== null &&
//           listing.price !== undefined
//             ? Number(listing.price)
//             : null,

//         weight:
//           listing.weight !== null &&
//           listing.weight !== undefined
//             ? Number(listing.weight)
//             : null,
//       },
//     });
//   } catch (error) {
//     console.error("[GET ONE LISTING ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch listing",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // CREATE LISTING
// // POST /api/listings
// // ==========================================

// exports.create = async (req, res) => {
//   try {
//     const {
//       title,
//       category_id,
//       breed_id,
//       price,
//       description,
//       negotiable,
//       gender,
//       age,
//       weight,
//       colour,
//       location,
//       images,
//     } = req.body;

//     console.log("=================================");
//     console.log("🐄 CREATE LISTING");
//     console.log("USER:", req.user);
//     console.log("=================================");

//     // ==========================================
//     // AUTH
//     // ==========================================

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: "User not authenticated",
//       });
//     }

//     const sellerId = Number(req.user.id);

//     if (!Number.isInteger(sellerId)) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid user ID",
//       });
//     }

//     // ==========================================
//     // BASIC VALIDATION
//     // ==========================================

//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: "Title is required",
//       });
//     }

//     if (!category_id) {
//       return res.status(400).json({
//         success: false,
//         error: "Category is required",
//       });
//     }

//     if (!isUuid(category_id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid category ID",
//       });
//     }

//     if (!breed_id) {
//       return res.status(400).json({
//         success: false,
//         error: "Breed is required",
//       });
//     }

//     if (!isUuid(breed_id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid breed ID",
//       });
//     }

//     if (
//       price === undefined ||
//       price === null ||
//       price === ""
//     ) {
//       return res.status(400).json({
//         success: false,
//         error: "Price is required",
//       });
//     }

//     if (!description || !description.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: "Description is required",
//       });
//     }

//     if (!location || typeof location !== "object") {
//       return res.status(400).json({
//         success: false,
//         error: "Location is required",
//       });
//     }

//     if (!location.city) {
//       return res.status(400).json({
//         success: false,
//         error: "City is required",
//       });
//     }

//     if (!location.area) {
//       return res.status(400).json({
//         success: false,
//         error: "Area is required",
//       });
//     }

//     // ==========================================
//     // PRICE
//     // ==========================================

//     const numericPrice = Number(price);

//     if (
//       !Number.isFinite(numericPrice) ||
//       numericPrice < 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid price",
//       });
//     }

//     // ==========================================
//     // WEIGHT
//     // ==========================================

//     let numericWeight = null;

//     if (
//       weight !== undefined &&
//       weight !== null &&
//       weight !== ""
//     ) {
//       numericWeight = Number(weight);

//       if (
//         !Number.isFinite(numericWeight) ||
//         numericWeight < 0
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "Invalid weight",
//         });
//       }
//     }

//     // ==========================================
//     // LATITUDE / LONGITUDE
//     // ==========================================

//     let latitude = null;
//     let longitude = null;

//     if (
//       location.latitude !== undefined &&
//       location.latitude !== null &&
//       location.latitude !== ""
//     ) {
//       latitude = Number(location.latitude);

//       if (
//         !Number.isFinite(latitude) ||
//         latitude < -90 ||
//         latitude > 90
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "Invalid latitude",
//         });
//       }
//     }

//     if (
//       location.longitude !== undefined &&
//       location.longitude !== null &&
//       location.longitude !== ""
//     ) {
//       longitude = Number(location.longitude);

//       if (
//         !Number.isFinite(longitude) ||
//         longitude < -180 ||
//         longitude > 180
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "Invalid longitude",
//         });
//       }
//     }

//     // ==========================================
//     // CHECK CATEGORY
//     // ==========================================

//     const category =
//       await prisma.animal_categories.findFirst({
//         where: {
//           id: category_id,
//           is_active: true,
//         },

//         select: {
//           id: true,
//           name: true,
//         },
//       });

//     if (!category) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid or inactive category",
//       });
//     }

//     // ==========================================
//     // CHECK BREED
//     // ==========================================

//     const breed =
//       await prisma.animal_breeds.findFirst({
//         where: {
//           id: breed_id,
//           category_id,
//           is_active: true,
//         },

//         select: {
//           id: true,
//           name: true,
//           category_id: true,
//         },
//       });

//     if (!breed) {
//       return res.status(400).json({
//         success: false,
//         error:
//           "Invalid breed or breed does not belong to selected category",
//       });
//     }

//     // ==========================================
//     // CHECK SELLER PROFILE
//     // ==========================================

//     const seller =
//       await prisma.seller_profiles.findUnique({
//         where: {
//           user_id: sellerId,
//         },
//       });

//     if (!seller) {
//       return res.status(403).json({
//         success: false,
//         error: "Seller profile not found",
//       });
//     }

//     // ==========================================
//     // IMAGES VALIDATION
//     // ==========================================

//     if (
//       images !== undefined &&
//       images !== null &&
//       !Array.isArray(images)
//     ) {
//       return res.status(400).json({
//         success: false,
//         error: "Images must be an array",
//       });
//     }

//     if (Array.isArray(images) && images.length > 10) {
//       return res.status(400).json({
//         success: false,
//         error: "Maximum 10 images are allowed",
//       });
//     }

//     // ==========================================
//     // CREATE LISTING
//     // ==========================================

//     const listing =
//       await prisma.listings.create({
//         data: {
//           seller_id: sellerId,

//           category_id,

//           breed_id,

//           title: title.trim(),

//           description: description.trim(),

//           price: numericPrice,

//           negotiable:
//             negotiable !== undefined
//               ? Boolean(negotiable)
//               : true,

//           gender:
//             gender && String(gender).trim()
//               ? String(gender).trim()
//               : null,

//           age:
//             age && String(age).trim()
//               ? String(age).trim()
//               : null,

//           weight: numericWeight,

//           colour:
//             colour && String(colour).trim()
//               ? String(colour).trim()
//               : null,

//           city: String(location.city).trim(),

//           area: String(location.area).trim(),

//           district:
//             location.district
//               ? String(location.district).trim()
//               : null,

//           state:
//             location.state
//               ? String(location.state).trim()
//               : null,

//           latitude,

//           longitude,

//           // New listings require admin approval
//           status: "PENDING_REVIEW",

//           // ======================================
//           // CREATE IMAGES
//           // ======================================

//           images:
//             Array.isArray(images) &&
//             images.length > 0
//               ? {
//                   create: images
//                     .filter((image) => {
//                       if (typeof image === "string") {
//                         return image.trim().length > 0;
//                       }

//                       return (
//                         image &&
//                         typeof image === "object" &&
//                         image.media_url
//                       );
//                     })
//                     .map((image, index) => ({
//                       media_url:
//                         typeof image === "string"
//                           ? image
//                           : image.media_url,

//                       cloudinary_public_id:
//                         typeof image === "object"
//                           ? image.cloudinary_public_id ||
//                             null
//                           : null,

//                       type:
//                         typeof image === "object"
//                           ? image.type || "image"
//                           : "image",

//                       is_primary:
//                         index === 0,

//                       sort_order: index,
//                     })),
//                 }
//               : undefined,
//         },

//         include: {
//           category: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },

//           breed: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },

//           images: {
//             orderBy: {
//               sort_order: "asc",
//             },
//           },

//           seller: {
//             select: {
//               id: true,
//               name: true,
//               full_name: true,
//               city: true,
//               district: true,
//             },
//           },
//         },
//       });

//     console.log("=================================");
//     console.log("✅ LISTING CREATED");
//     console.log("LISTING ID:", listing.id);
//     console.log("STATUS:", listing.status);
//     console.log("=================================");

//     return res.status(201).json({
//       success: true,

//       message:
//         "Listing created successfully and submitted for review",

//       listing,
//     });
//   } catch (error) {
//     console.error("[CREATE LISTING ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to create listing",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // MY LISTINGS
// // GET /api/listings/mine
// // ==========================================

// exports.mine = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: "User not authenticated",
//       });
//     }

//     const sellerId = Number(req.user.id);

//     if (!Number.isInteger(sellerId)) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid user ID",
//       });
//     }

//     const listings =
//       await prisma.listings.findMany({
//         where: {
//           seller_id: sellerId,
//         },

//         orderBy: {
//           created_at: "desc",
//         },

//         include: {
//           category: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },

//           breed: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },

//           images: {
//             orderBy: {
//               sort_order: "asc",
//             },
//           },
//         },
//       });

//     return res.status(200).json({
//       success: true,
//       count: listings.length,
//       listings,
//     });
//   } catch (error) {
//     console.error("[MY LISTINGS ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch your listings",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // DELETE LISTING
// // DELETE /api/listings/:id
// // ==========================================

// exports.remove = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("🗑️ DELETE LISTING:", id);

//     // ==========================================
//     // UUID VALIDATION
//     // ==========================================

//     if (!id || !isUuid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid listing ID",
//       });
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: "User not authenticated",
//       });
//     }

//     const userId = Number(req.user.id);

//     // ==========================================
//     // FIND LISTING
//     // ==========================================

//     const listing =
//       await prisma.listings.findUnique({
//         where: {
//           id,
//         },
//       });

//     if (!listing) {
//       return res.status(404).json({
//         success: false,
//         error: "Listing not found",
//       });
//     }

//     // ==========================================
//     // ADMIN CAN DELETE
//     // ==========================================

//     const isAdmin =
//       String(req.user.role || "").toUpperCase() ===
//       "ADMIN";

//     if (!isAdmin && listing.seller_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         error: "Not your listing",
//       });
//     }

//     // ==========================================
//     // DELETE
//     // ==========================================

//     await prisma.listings.delete({
//       where: {
//         id,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Listing deleted successfully",
//     });
//   } catch (error) {
//     console.error("[DELETE LISTING ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to delete listing",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // APPROVE LISTING
// // PATCH /api/listings/:id/approve
// // ==========================================

// exports.approve = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("✅ APPROVE LISTING:", id);

//     // ==========================================
//     // UUID VALIDATION
//     // ==========================================

//     if (!id || !isUuid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid listing ID",
//       });
//     }

//     // ==========================================
//     // FIND LISTING
//     // ==========================================

//     const listing =
//       await prisma.listings.findUnique({
//         where: {
//           id,
//         },
//       });

//     if (!listing) {
//       return res.status(404).json({
//         success: false,
//         error: "Listing not found",
//       });
//     }

//     // ==========================================
//     // UPDATE
//     // ==========================================

//     const updatedListing =
//       await prisma.listings.update({
//         where: {
//           id,
//         },

//         data: {
//           status: "ACTIVE",
//         },
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Listing approved",
//       listing: updatedListing,
//     });
//   } catch (error) {
//     console.error("[APPROVE LISTING ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to approve listing",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// // ==========================================
// // REJECT LISTING
// // PATCH /api/listings/:id/reject
// // ==========================================

// exports.reject = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("❌ REJECT LISTING:", id);

//     // ==========================================
//     // UUID VALIDATION
//     // ==========================================

//     if (!id || !isUuid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid listing ID",
//       });
//     }

//     // ==========================================
//     // FIND LISTING
//     // ==========================================

//     const listing =
//       await prisma.listings.findUnique({
//         where: {
//           id,
//         },
//       });

//     if (!listing) {
//       return res.status(404).json({
//         success: false,
//         error: "Listing not found",
//       });
//     }

//     // ==========================================
//     // UPDATE
//     // ==========================================

//     const updatedListing =
//       await prisma.listings.update({
//         where: {
//           id,
//         },

//         data: {
//           status: "REJECTED",
//         },
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Listing rejected",
//       listing: updatedListing,
//     });
//   } catch (error) {
//     console.error("[REJECT LISTING ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to reject listing",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

const prisma = require("../prisma");

// ==========================================
// UUID VALIDATION
// ==========================================

const isUuid = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

// ==========================================
// GET ALL LISTINGS
// GET /api/listings
// ==========================================


exports.getAll = async (req, res) => {
  try {
    const {
      category,
      breed,
      q,
      location,
    } = req.query;

    // Pagination: 10 listings per page
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      10,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const where = {
      status: "ACTIVE",
    };

    if (category && category !== "all") {
      where.category = {
        name: {
          equals: category,
          mode: "insensitive",
        },
      };
    }

    if (breed && breed !== "all") {
      where.breed = {
        name: {
          equals: breed,
          mode: "insensitive",
        },
      };
    }

    const conditions = [];

    if (location) {
      conditions.push({
        OR: [
          {
            city: {
              contains: location,
              mode: "insensitive",
            },
          },
          {
            area: {
              contains: location,
              mode: "insensitive",
            },
          },
          {
            district: {
              contains: location,
              mode: "insensitive",
            },
          },
          {
            state: {
              contains: location,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    if (q) {
      conditions.push({
        OR: [
          {
            title: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            colour: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            breed: {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
          },
          {
            category: {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Count and fetch the same filtered listings
    const [total, listings] = await Promise.all([
      prisma.listings.count({ where }),

      prisma.listings.findMany({
        where,

        // Latest listings first
        orderBy: [
          { created_at: "desc" },
          { id: "desc" },
        ],

        skip,
        take: limit,

        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          breed: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          images: {
            orderBy: {
              sort_order: "asc",
            },
          },

          seller: {
            select: {
              id: true,
              name: true,
              full_name: true,
              city: true,
              district: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + listings.length < total,
      listings,
    });
  } catch (error) {
    console.error("[GET ALL LISTINGS ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch listings",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// GET NEARBY LISTINGS
// GET /api/listings/nearby
// ==========================================

// ==========================================
// GET NEARBY LISTINGS
// GET /api/listings/nearby
// ==========================================

// exports.nearby = async (req, res) => {
//   try {
//     const latitude = Number(req.query.latitude);
//     const longitude = Number(req.query.longitude);
//     const radius = Number(req.query.radius || 100);

//     console.log("=================================");
//     console.log("🐄 NEARBY LISTINGS REQUEST");
//     console.log("Latitude:", latitude);
//     console.log("Longitude:", longitude);
//     console.log("Radius:", radius, "km");
//     console.log("=================================");

//     /* ==========================================
//        VALIDATION
//     ========================================== */

//     if (!Number.isFinite(latitude)) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid latitude is required",
//       });
//     }

//     if (!Number.isFinite(longitude)) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid longitude is required",
//       });
//     }

//     if (latitude < -90 || latitude > 90) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid latitude",
//       });
//     }

//     if (longitude < -180 || longitude > 180) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid longitude",
//       });
//     }

//     if (!Number.isFinite(radius) || radius <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid radius",
//       });
//     }

//     const safeRadius = Math.min(radius, 1000);

//     /* ==========================================
//        HAVERSINE QUERY + IMAGES + CATEGORY + BREED
//     ========================================== */

//     const listings = await prisma.$queryRaw`
//       SELECT
//         l.id AS listing_id,
//         l.title,
//         l.description,
//         l.price,
//         l.negotiable,
//         l.status,
//         l.created_at,

//         l.gender,
//         l.age,
//         l.weight,
//         l.colour,

//         l.area,
//         l.city,
//         l.district,
//         l.state,

//         l.latitude,
//         l.longitude,

//         ac.id AS category_id,
//         ac.name AS category_name,

//         ab.id AS breed_id,
//         ab.name AS breed_name,

//         -- 🔥 IMAGES ARRAY (from listing_images table)
//         COALESCE(
//           (
//             SELECT json_agg(
//               json_build_object(
//                 'id', li.id,
//                 'media_url', li.media_url,
//                 'cloudinary_public_id', li.cloudinary_public_id,
//                 'is_primary', li.is_primary,
//                 'sort_order', li.sort_order
//               )
//               ORDER BY li.sort_order ASC, li.id ASC
//             )
//             FROM listing_images li
//             WHERE li.listing_id = l.id
//           ),
//           '[]'::json
//         ) AS images,

//         -- 🔥 FIRST IMAGE (primary) for easy frontend use
//         (
//           SELECT li.media_url
//           FROM listing_images li
//           WHERE li.listing_id = l.id
//           ORDER BY li.is_primary DESC, li.sort_order ASC, li.id ASC
//           LIMIT 1
//         ) AS image_url,

//         (
//           6371 * acos(
//             LEAST(
//               1,
//               GREATEST(
//                 -1,

//                 cos(radians(${latitude}))
//                 *
//                 cos(radians(l.latitude))
//                 *
//                 cos(
//                   radians(l.longitude)
//                   -
//                   radians(${longitude})
//                 )
//                 +
//                 sin(radians(${latitude}))
//                 *
//                 sin(radians(l.latitude))
//               )
//             )
//           )
//         ) AS distance_km

//       FROM listings l

//       LEFT JOIN animal_categories ac
//         ON ac.id = l.category_id

//       LEFT JOIN animal_breeds ab
//         ON ab.id = l.breed_id

//       WHERE
//         l.status = 'ACTIVE'

//         AND l.latitude IS NOT NULL
//         AND l.longitude IS NOT NULL

//         AND (
//           6371 * acos(
//             LEAST(
//               1,
//               GREATEST(
//                 -1,

//                 cos(radians(${latitude}))
//                 *
//                 cos(radians(l.latitude))
//                 *
//                 cos(
//                   radians(l.longitude)
//                   -
//                   radians(${longitude})
//                 )
//                 +
//                 sin(radians(${latitude}))
//                 *
//                 sin(radians(l.latitude))
//               )
//             )
//           )
//         ) <= ${safeRadius}

//       ORDER BY distance_km ASC
//     `;

//     /* ==========================================
//        FORMAT RESPONSE
//     ========================================== */

//     const formattedListings = listings.map((item) => {
//       // 🔥 Parse images JSON
//       let images = [];
//       try {
//         if (Array.isArray(item.images)) {
//           images = item.images;
//         } else if (typeof item.images === "string") {
//           images = JSON.parse(item.images);
//         }
//       } catch (e) {
//         images = [];
//       }

//       // 🔥 Primary image URL
//       const imageUrl =
//         item.image_url ||
//         images[0]?.media_url ||
//         null;

//       return {
//         listing_id: item.listing_id,

//         title: item.title,
//         description: item.description,

//         price:
//           item.price !== null && item.price !== undefined
//             ? Number(item.price)
//             : 0,

//         negotiable: item.negotiable,
//         status: item.status,
//         created_at: item.created_at,

//         gender: item.gender,
//         age: item.age,

//         weight:
//           item.weight !== null && item.weight !== undefined
//             ? Number(item.weight)
//             : null,

//         colour: item.colour,

//         category_id: item.category_id,
//         category_name: item.category_name,

//         breed_id: item.breed_id,
//         breed_name: item.breed_name,

//         area: item.area,
//         city: item.city,
//         district: item.district,
//         state: item.state,

//         // 🔥 IMAGE FIELDS
//         image_url: imageUrl,
//         images: images,

//         distance_km:
//           item.distance_km !== null && item.distance_km !== undefined
//             ? Number(Number(item.distance_km).toFixed(2))
//             : null,
//       };
//     });

//     console.log("🐄 NEARBY LISTINGS FOUND:", formattedListings.length);

//     if (formattedListings.length > 0) {
//       formattedListings.forEach((item, index) => {
//         console.log(
//           `🐄 ${index + 1}.`,
//           item.title,
//           "|",
//           item.category_name,
//           "|",
//           item.city,
//           "|",
//           item.distance_km,
//           "km |",
//           "Image:",
//           item.image_url || "❌ NONE"
//         );
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: formattedListings.length,
//       radius_km: safeRadius,
//       listings: formattedListings,
//     });
//   } catch (error) {
//     console.error("[NEARBY LISTINGS ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch nearby listings",
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };
// ==========================================
// GET NEARBY LISTINGS WITH SEARCH
// GET /api/listings/nearby
// Query params:
//   latitude, longitude, radius
//   search (optional) - animal search keyword
// ==========================================

exports.nearby = async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = Number(req.query.radius || 100);
    const search = req.query.search
      ? String(req.query.search).trim()
      : "";

    console.log("=================================");
    console.log("🐄 NEARBY LISTINGS REQUEST");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Radius:", radius, "km");
    console.log("Search:", search || "(none)");
    console.log("=================================");

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!Number.isFinite(latitude)) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude is required",
      });
    }

    if (!Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        error: "Valid longitude is required",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: "Invalid latitude",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: "Invalid longitude",
      });
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid radius",
      });
    }

    const safeRadius = Math.min(radius, 1000);

    // ==========================================
    // BUILD SEARCH CONDITION
    // ==========================================

    let searchCondition = "";
    const queryParams = [latitude, longitude, safeRadius];

    if (search && search.length > 0) {
      const searchPattern = `%${search.toLowerCase()}%`;

      searchCondition = `
        AND (
          LOWER(COALESCE(l.title, '')) LIKE $4
          OR LOWER(COALESCE(l.description, '')) LIKE $4
          OR LOWER(COALESCE(l.colour, '')) LIKE $4
          OR LOWER(COALESCE(l.gender, '')) LIKE $4
          OR LOWER(COALESCE(ac.name, '')) LIKE $4
          OR LOWER(COALESCE(ab.name, '')) LIKE $4
          OR LOWER(COALESCE(l.city, '')) LIKE $4
          OR LOWER(COALESCE(l.area, '')) LIKE $4
          OR LOWER(COALESCE(l.district, '')) LIKE $4
          OR LOWER(COALESCE(l.state, '')) LIKE $4
        )
      `;

      queryParams.push(searchPattern);
    }

    // ==========================================
    // BUILD FINAL SQL
    // ==========================================

    const sql = `
      SELECT
        l.id AS listing_id,
        l.title,
        l.description,
        l.price,
        l.negotiable,
        l.status,
        l.created_at,

        l.gender,
        l.age,
        l.weight,
        l.colour,

        l.area,
        l.city,
        l.district,
        l.state,

        l.latitude,
        l.longitude,

        ac.id AS category_id,
        ac.name AS category_name,

        ab.id AS breed_id,
        ab.name AS breed_name,

        -- IMAGES ARRAY
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', li.id,
                'media_url', li.media_url,
                'cloudinary_public_id', li.cloudinary_public_id,
                'is_primary', li.is_primary,
                'sort_order', li.sort_order
              )
              ORDER BY li.sort_order ASC, li.id ASC
            )
            FROM listing_images li
            WHERE li.listing_id = l.id
          ),
          '[]'::json
        ) AS images,

        -- FIRST IMAGE URL
        (
          SELECT li.media_url
          FROM listing_images li
          WHERE li.listing_id = l.id
          ORDER BY li.is_primary DESC, li.sort_order ASC, li.id ASC
          LIMIT 1
        ) AS image_url,

        (
          6371 * acos(
            LEAST(
              1,
              GREATEST(
                -1,
                cos(radians($1))
                * cos(radians(l.latitude))
                * cos(radians(l.longitude) - radians($2))
                + sin(radians($1))
                * sin(radians(l.latitude))
              )
            )
          )
        ) AS distance_km

      FROM listings l

      LEFT JOIN animal_categories ac
        ON ac.id = l.category_id

      LEFT JOIN animal_breeds ab
        ON ab.id = l.breed_id

      WHERE
        l.status = 'ACTIVE'
        AND l.latitude IS NOT NULL
        AND l.longitude IS NOT NULL

        ${searchCondition}

        AND (
          6371 * acos(
            LEAST(
              1,
              GREATEST(
                -1,
                cos(radians($1))
                * cos(radians(l.latitude))
                * cos(radians(l.longitude) - radians($2))
                + sin(radians($1))
                * sin(radians(l.latitude))
              )
            )
          )
        ) <= $3

      ORDER BY distance_km ASC
    `;

    // ==========================================
    // EXECUTE RAW QUERY
    // ==========================================

    const listings = await prisma.$queryRawUnsafe(sql, ...queryParams);

    // ==========================================
    // FORMAT RESPONSE
    // ==========================================

    const formattedListings = listings.map((item) => {
      let images = [];
      try {
        if (Array.isArray(item.images)) {
          images = item.images;
        } else if (typeof item.images === "string") {
          images = JSON.parse(item.images);
        }
      } catch (e) {
        images = [];
      }

      const imageUrl =
        item.image_url || images[0]?.media_url || null;

      return {
        listing_id: item.listing_id,

        title: item.title,
        description: item.description,

        price:
          item.price !== null && item.price !== undefined
            ? Number(item.price)
            : 0,

        negotiable: item.negotiable,
        status: item.status,
        created_at: item.created_at,

        gender: item.gender,
        age: item.age,

        weight:
          item.weight !== null && item.weight !== undefined
            ? Number(item.weight)
            : null,

        colour: item.colour,

        category_id: item.category_id,
        category_name: item.category_name,

        breed_id: item.breed_id,
        breed_name: item.breed_name,

        area: item.area,
        city: item.city,
        district: item.district,
        state: item.state,

        // 🔥 IMAGE FIELDS
        image_url: imageUrl,
        images: images,

        distance_km:
          item.distance_km !== null && item.distance_km !== undefined
            ? Number(Number(item.distance_km).toFixed(2))
            : null,
      };
    });

    console.log(
      `🐄 NEARBY LISTINGS FOUND: ${formattedListings.length}`,
      search ? `(search: "${search}")` : ""
    );

    if (formattedListings.length > 0) {
      formattedListings.forEach((item, index) => {
        console.log(
          `🐄 ${index + 1}.`,
          item.title,
          "|",
          item.category_name,
          "|",
          item.city,
          "|",
          item.distance_km,
          "km | Image:",
          item.image_url ? "✓" : "✗"
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: formattedListings.length,
      radius_km: safeRadius,
      search: search || null,
      listings: formattedListings,
    });
  } catch (error) {
    console.error("[NEARBY LISTINGS ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch nearby listings",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// GET SINGLE LISTING
// GET /api/listings/:id
// ==========================================

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=================================");
    console.log("🔎 GET ONE LISTING");
    console.log("LISTING ID:", id);
    console.log("=================================");

    if (!id || !isUuid(id)) {
      console.log("❌ INVALID LISTING UUID:", id);

      return res.status(400).json({
        success: false,
        error: "Invalid listing ID",
      });
    }

    const listing = await prisma.listings.findUnique({
      where: {
        id,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        breed: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            sort_order: "asc",
          },
        },

        seller: {
          select: {
            id: true,
            name: true,
            full_name: true,
            city: true,
            district: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const isOwner =
      req.user &&
      Number(req.user.id) === Number(listing.seller_id);

    const isAdmin =
      req.user &&
      String(req.user.role || "").toUpperCase() === "ADMIN";

    if (
      listing.status !== "ACTIVE" &&
      !isOwner &&
      !isAdmin
    ) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,

      listing: {
        ...listing,

        price:
          listing.price !== null &&
          listing.price !== undefined
            ? Number(listing.price)
            : null,

        weight:
          listing.weight !== null &&
          listing.weight !== undefined
            ? Number(listing.weight)
            : null,
      },
    });
  } catch (error) {
    console.error("[GET ONE LISTING ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch listing",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// CREATE LISTING
// POST /api/listings
// ==========================================

exports.create = async (req, res) => {
  try {
    const {
      title,
      category_id,
      breed_id,
      price,
      description,
      negotiable,
      gender,
      age,
      weight,
      colour,
      location,
      images,
    } = req.body;

    console.log("=================================");
    console.log("🐄 CREATE LISTING");
    console.log("USER:", req.user);
    console.log("=================================");

    // ==========================================
    // AUTH
    // ==========================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const sellerId = Number(req.user.id);

    if (!Number.isInteger(sellerId)) {
      return res.status(401).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    if (!isUuid(category_id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    if (!breed_id) {
      return res.status(400).json({
        success: false,
        error: "Breed is required",
      });
    }

    if (!isUuid(breed_id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid breed ID",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        error: "Price is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: "Description is required",
      });
    }

    if (!location || typeof location !== "object") {
      return res.status(400).json({
        success: false,
        error: "Location is required",
      });
    }

    if (!location.city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }

    if (!location.area) {
      return res.status(400).json({
        success: false,
        error: "Area is required",
      });
    }

    // ==========================================
    // PRICE
    // ==========================================

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid price",
      });
    }

    // ==========================================
    // WEIGHT
    // ==========================================

    let numericWeight = null;

    if (
      weight !== undefined &&
      weight !== null &&
      weight !== ""
    ) {
      numericWeight = Number(weight);

      if (
        !Number.isFinite(numericWeight) ||
        numericWeight < 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid weight",
        });
      }
    }

    // ==========================================
    // LOCATION
    // ==========================================

    let latitude = null;
    let longitude = null;

    if (
      location.latitude !== undefined &&
      location.latitude !== null &&
      location.latitude !== ""
    ) {
      latitude = Number(location.latitude);

      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid latitude",
        });
      }
    }

    if (
      location.longitude !== undefined &&
      location.longitude !== null &&
      location.longitude !== ""
    ) {
      longitude = Number(location.longitude);

      if (
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid longitude",
        });
      }
    }

    // ==========================================
    // CATEGORY
    // ==========================================

    const category =
      await prisma.animal_categories.findFirst({
        where: {
          id: category_id,
          is_active: true,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Invalid or inactive category",
      });
    }

    // ==========================================
    // BREED
    // ==========================================

    const breed =
      await prisma.animal_breeds.findFirst({
        where: {
          id: breed_id,
          category_id,
          is_active: true,
        },

        select: {
          id: true,
          name: true,
          category_id: true,
        },
      });

    if (!breed) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid breed or breed does not belong to selected category",
      });
    }

    // ==========================================
    // SELLER PROFILE
    // ==========================================

    const seller =
      await prisma.seller_profiles.findUnique({
        where: {
          user_id: sellerId,
        },
      });

    if (!seller) {
      return res.status(403).json({
        success: false,
        error: "Seller profile not found",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================

    if (
      images !== undefined &&
      images !== null &&
      !Array.isArray(images)
    ) {
      return res.status(400).json({
        success: false,
        error: "Images must be an array",
      });
    }

    if (Array.isArray(images) && images.length > 10) {
      return res.status(400).json({
        success: false,
        error: "Maximum 10 images are allowed",
      });
    }

    // ==========================================
    // CREATE LISTING
    // ==========================================

    const listing = await prisma.listings.create({
      data: {
        seller_id: sellerId,

        category_id,

        breed_id,

        title: title.trim(),

        description: description.trim(),

        price: numericPrice,

        negotiable:
          negotiable !== undefined
            ? Boolean(negotiable)
            : true,

        gender:
          gender && String(gender).trim()
            ? String(gender).trim()
            : null,

        age:
          age && String(age).trim()
            ? String(age).trim()
            : null,

        weight: numericWeight,

        colour:
          colour && String(colour).trim()
            ? String(colour).trim()
            : null,

        city: String(location.city).trim(),

        area: String(location.area).trim(),

        district:
          location.district
            ? String(location.district).trim()
            : null,

        state:
          location.state
            ? String(location.state).trim()
            : null,

        latitude,

        longitude,

        // ==========================================
        // IMPORTANT:
        // LISTING IS ACTIVE IMMEDIATELY
        // ==========================================

        status: "ACTIVE",

        // ==========================================
        // IMAGES
        // ==========================================

        images:
          Array.isArray(images) &&
          images.length > 0
            ? {
                create: images
                  .filter((image) => {
                    if (typeof image === "string") {
                      return image.trim().length > 0;
                    }

                    return (
                      image &&
                      typeof image === "object" &&
                      image.media_url
                    );
                  })
                  .map((image, index) => ({
                    media_url:
                      typeof image === "string"
                        ? image
                        : image.media_url,

                    cloudinary_public_id:
                      typeof image === "object"
                        ? image.cloudinary_public_id || null
                        : null,

                    type:
                      typeof image === "object"
                        ? image.type || "image"
                        : "image",

                    is_primary: index === 0,

                    sort_order: index,
                  })),
              }
            : undefined,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        breed: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            sort_order: "asc",
          },
        },

        seller: {
          select: {
            id: true,
            name: true,
            full_name: true,
            city: true,
            district: true,
          },
        },
      },
    });

    console.log("=================================");
    console.log("✅ LISTING CREATED");
    console.log("LISTING ID:", listing.id);
    console.log("STATUS:", listing.status);
    console.log("LATITUDE:", listing.latitude);
    console.log("LONGITUDE:", listing.longitude);
    console.log("CITY:", listing.city);
    console.log("AREA:", listing.area);
    console.log("=================================");

    return res.status(201).json({
      success: true,

      message: "Listing created successfully",

      listing,
    });
  } catch (error) {
    console.error("[CREATE LISTING ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to create listing",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// MY LISTINGS
// GET /api/listings/mine
// ==========================================

exports.mine = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const sellerId = Number(req.user.id);

    if (!Number.isInteger(sellerId)) {
      return res.status(401).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const listings =
      await prisma.listings.findMany({
        where: {
          seller_id: sellerId,
        },

        orderBy: {
          created_at: "desc",
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          breed: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          images: {
            orderBy: {
              sort_order: "asc",
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("[MY LISTINGS ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch your listings",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// DELETE LISTING
// DELETE /api/listings/:id
// ==========================================

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ DELETE LISTING:", id);

    if (!id || !isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing ID",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = Number(req.user.id);

    const listing =
      await prisma.listings.findUnique({
        where: {
          id,
        },
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const isAdmin =
      String(req.user.role || "").toUpperCase() ===
      "ADMIN";

    if (!isAdmin && listing.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not your listing",
      });
    }

    await prisma.listings.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE LISTING ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to delete listing",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// APPROVE LISTING
// PATCH /api/listings/:id/approve
// ==========================================

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("✅ APPROVE LISTING:", id);

    if (!id || !isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing ID",
      });
    }

    const listing =
      await prisma.listings.findUnique({
        where: {
          id,
        },
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const updatedListing =
      await prisma.listings.update({
        where: {
          id,
        },

        data: {
          status: "ACTIVE",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Listing approved",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("[APPROVE LISTING ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to approve listing",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// REJECT LISTING
// PATCH /api/listings/:id/reject
// ==========================================

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("❌ REJECT LISTING:", id);

    if (!id || !isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing ID",
      });
    }

    const listing =
      await prisma.listings.findUnique({
        where: {
          id,
        },
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const updatedListing =
      await prisma.listings.update({
        where: {
          id,
        },

        data: {
          status: "REJECTED",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Listing rejected",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("[REJECT LISTING ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to reject listing",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};