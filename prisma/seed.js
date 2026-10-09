const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  {
    name: "Cow",
    slug: "cow",
    breeds: [
      "Gir",
      "Sahiwal",
      "Jersey",
      "Holstein Friesian",
      "Red Sindhi",
      "Kangayam",
      "Hallikar",
      "Ongole",
    ],
  },
  {
    name: "Buffalo",
    slug: "buffalo",
    breeds: [
      "Murrah",
      "Jaffarabadi",
      "Mehsana",
      "Surti",
      "Nili Ravi",
      "Banni",
    ],
  },
  {
    name: "Calf",
    slug: "calf",
    breeds: [
      "Cow Calf",
      "Buffalo Calf",
    ],
  },
  {
    name: "Goat",
    slug: "goat",
    breeds: [
      "Boer",
      "Jamunapari",
      "Barbari",
      "Sirohi",
      "Beetal",
      "Osmanabadi",
      "Kanni Adu",
      "Salem Black",
    ],
  },
  {
    name: "Sheep",
    slug: "sheep",
    breeds: [
      "Mecheri",
      "Vembur",
      "Mandya",
      "Deccani",
      "Nellore",
      "Rambouillet",
    ],
  },
  {
    name: "Poultry",
    slug: "poultry",
    breeds: [
      "Chicken",
      "Duck",
      "Turkey",
      "Quail",
      "Goose",
    ],
  },
  {
    name: "Dog",
    slug: "dog",
    breeds: [
      "Labrador Retriever",
      "Golden Retriever",
      "German Shepherd",
      "Beagle",
      "Pomeranian",
      "Indian Pariah",
      "Rajapalayam",
      "Chippiparai",
      "Kombai",
      "Mudhol Hound",
    ],
  },
  {
    name: "Cat",
    slug: "cat",
    breeds: [
      "Indian Domestic Cat",
      "Persian",
      "Siamese",
      "Maine Coon",
      "Bengal",
      "Ragdoll",
    ],
  },
];

async function main() {
  console.log("Starting PetMarket category seed...");

  for (const categoryData of categories) {
    const category = await prisma.animal_categories.upsert({
      where: {
        slug: categoryData.slug,
      },
      update: {
        name: categoryData.name,
        is_active: true,
      },
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        is_active: true,
      },
    });

    console.log(`Category: ${category.name} (${category.id})`);

    for (const breedName of categoryData.breeds) {
      const breedSlug = breedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await prisma.animal_breeds.upsert({
        where: {
          category_id_slug: {
            category_id: category.id,
            slug: breedSlug,
          },
        },
        update: {
          name: breedName,
          is_active: true,
        },
        create: {
          category_id: category.id,
          name: breedName,
          slug: breedSlug,
          is_active: true,
        },
      });
    }
  }

  console.log("PetMarket categories and breeds seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });