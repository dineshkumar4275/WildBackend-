
// =====================================================
// PETMARKET - ALLOWED DOMESTIC ANIMALS
// =====================================================
//
// Category and breed IDs are generated automatically
// by PostgreSQL/Prisma.
//
// The database is the PRIMARY source of truth for
// categories and breeds.
//
// This file is mainly used for:
// 1. Blocked / wild animal keyword protection
// 2. Optional future validation
//
// =====================================================

exports.ALLOWED_BREEDS = {
  COW: [
    "Jersey",
    "Holstein Friesian",
    "Gir",
    "Sahiwal",
    "Red Sindhi",
    "Tharparkar",
    "Kangayam",
    "Ongole",
    "Hariana",
    "Rathi",
    "Hallikar",
    "Deoni",
    "Vechur",
  ],

  BUFFALO: [
    "Murrah",
    "Jaffarabadi",
    "Mehsana",
    "Surti",
    "Nili-Ravi",
    "Bhadawari",
    "Pandharpuri",
  ],

  CALF: [
    "Jersey",
    "Holstein Friesian",
    "Gir",
    "Sahiwal",
    "Red Sindhi",
    "Kangayam",
    "Ongole",
    "Hallikar",
    "Vechur",
  ],

  GOAT: [
    "Boer",
    "Jamunapari",
    "Beetal",
    "Barbari",
    "Sirohi",
    "Osmanabadi",
    "Malabari",
    "Kanni Adu",
    "Kodi Adu",
    "Tellicherry",
  ],

  SHEEP: [
    "Mecheri",
    "Mandya",
    "Madura",
    "Deccani",
    "Nellore",
    "Bellary",
    "Ramanadhapuram White",
    "Vembur",
  ],

  POULTRY: [
    "Country Chicken",
    "Aseel",
    "Kadaknath",
    "Giriraja",
    "Vanaraja",
    "Gramapriya",
    "Broiler",
    "Layer",
    "Brahma",
    "Plymouth Rock",
    "Rhode Island Red",
    "Leghorn",
  ],

  DOG: [
    "Labrador Retriever",
    "Golden Retriever",
    "German Shepherd",
    "Beagle",
    "Pug",
    "Shih Tzu",
    "Pomeranian",
    "Rottweiler",
    "Doberman",
    "Boxer",
    "Dachshund",
    "Cocker Spaniel",
    "Indie / Desi Dog",
    "Rajapalayam",
    "Chippiparai",
    "Mudhol Hound",
  ],

  CAT: [
    "Persian",
    "Siamese",
    "Maine Coon",
    "Ragdoll",
    "Bengal",
    "British Shorthair",
    "American Shorthair",
    "Sphynx",
    "Indie / Domestic Shorthair",
  ],
};


// =====================================================
// BLOCKED / RESTRICTED ANIMAL KEYWORDS
// =====================================================
//
// These are additional protection checks.
// Even if somebody tries to enter a wild animal name
// in title/description/location/etc., the listing
// should be rejected.
//
// =====================================================

exports.BLOCKED_KEYWORDS = [
  "lion",
  "tiger",
  "leopard",
  "cheetah",
  "elephant",
  "rhino",
  "bear",
  "wolf",
  "fox",
  "monkey",
  "chimpanzee",
  "gorilla",
  "peacock",
  "peafowl",
  "eagle",
  "hawk",
  "falcon",
  "owl",
  "cobra",
  "python",
  "viper",
  "krait",
  "snake",
  "crocodile",
  "alligator",
  "pangolin",
  "deer",
  "antelope",
  "wild boar",
  "bison",
];

