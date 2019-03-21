const { prisma } = require('./generated/prisma-client')

// A `main` function so that we can use async/await
async function main() {

  // Create a new user called `Alice`
  const newUser = await prisma.createUser({ name: 'Alice' })
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`)

  // Read all users from the database and print them to the console
  // const allUsers = await prisma.users()
  // console.log(allUsers)

  const user = await prisma
      .user({ id: '5c92930524aa9a00071382ce' })
  console.log(user)

  const updatedUser = await prisma
      .updateUser({
        where: { id: '5c92930524aa9a00071382ce' },
        data: { name: 'Bob' }
      })
  console.log(updatedUser)
}

main().catch(e => console.error(e))

