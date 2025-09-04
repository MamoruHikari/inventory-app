import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: "Electronics" },
    { name: "Furniture" },
    { name: "Books" },
    { name: "Vehicles" },
    { name: "Clothing" },
    { name: "Tools" },
    { name: "Kitchen" },
    { name: "Sports" },
    { name: "Other" }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('Categories seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })