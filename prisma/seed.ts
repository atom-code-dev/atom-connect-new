import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Test user data
const users = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123',
    role: UserRole.ADMIN,
    phone: '+1234567890',
  },
  {
    email: 'freelancer@example.com',
    name: 'John Doe',
    password: 'freelancer123',
    role: UserRole.FREELANCER,
    phone: '+1234567891',
  },
  {
    email: 'organization@example.com',
    name: 'TechCorp Solutions',
    password: 'organization123',
    role: UserRole.ORGANIZATION,
    phone: '+1234567892',
  },
  {
    email: 'maintainer@example.com',
    name: 'Alice Johnson',
    password: 'maintainer123',
    role: UserRole.MAINTAINER,
    phone: '+1234567893',
  },
]

// Proper password hashing function using bcrypt
async function createPasswordHash(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

async function main() {
  console.log('Seeding database with NextAuth compatible data...')

  // Clear existing data (optional - comment out if you want to preserve existing data)
  console.log('Clearing existing data...')
  await prisma.trainingFeedback.deleteMany()
  await prisma.training.deleteMany()
  await prisma.stack.deleteMany()
  await prisma.trainingLocation.deleteMany()
  await prisma.trainingCategory.deleteMany()
  await prisma.maintainerProfile.deleteMany()
  await prisma.organizationProfile.deleteMany()
  await prisma.freelancerProfile.deleteMany()
  await prisma.adminProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  console.log('Existing data cleared.')

  // Create users directly
  console.log('Creating users...')
  
  for (const userData of users) {
    try {
      // Create user with password hash directly in the User model
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          emailVerified: new Date(), // Mark as verified for testing
          password: await createPasswordHash(userData.password), // Store hashed password directly
        },
      })

      console.log(`✓ Created user: ${userData.email}`)
      
      // Create corresponding profiles
      switch (userData.role) {
        case UserRole.ADMIN:
          await prisma.adminProfile.create({
            data: { userId: user.id },
          })
          console.log(`✓ Created admin profile for: ${userData.email}`)
          break

        case UserRole.FREELANCER:
          await prisma.freelancerProfile.create({
            data: {
              userId: user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'TypeScript']),
              trainerType: 'BOTH',
              experience: '5+ years of experience in web development and training',
              linkedinProfile: 'https://linkedin.com/in/johndoe',
              activity: 'Full-stack developer and trainer specializing in modern web technologies',
              location: 'New York, NY',
              availability: 'AVAILABLE',
            },
          })
          console.log(`✓ Created freelancer profile for: ${userData.email}`)
          break

        case UserRole.ORGANIZATION:
          await prisma.organizationProfile.create({
            data: {
              userId: user.id,
              organizationName: userData.name,
              website: 'https://techcorp.com',
              contactMail: userData.email,
              phone: userData.phone,
              companyLocation: 'San Francisco, CA',
              verifiedStatus: 'VERIFIED',
              activeStatus: 'ACTIVE',
              ratings: 4.5,
            },
          })
          console.log(`✓ Created organization profile for: ${userData.email}`)
          break

        case UserRole.MAINTAINER:
          await prisma.maintainerProfile.create({
            data: {
              userId: user.id,
              status: 'ACTIVE',
            },
          })
          console.log(`✓ Created maintainer profile for: ${userData.email}`)
          break
      }
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error)
    }
  }

  // Create training categories
  console.log('Creating training categories...')
  const categories = await Promise.all([
    prisma.trainingCategory.create({
      data: {
        name: 'Soft Skills',
        description: 'Communication, teamwork, and interpersonal skills',
      },
    }),
    prisma.trainingCategory.create({
      data: {
        name: 'Fundamentals',
        description: 'Basic programming concepts and computer science fundamentals',
      },
    }),
    prisma.trainingCategory.create({
      data: {
        name: 'Frameworks',
        description: 'Modern web frameworks and libraries',
      },
    }),
  ])
  console.log(`✓ Created ${categories.length} training categories`)

  // Create training locations
  console.log('Creating training locations...')
  const locations = await Promise.all([
    prisma.trainingLocation.create({
      data: {
        state: 'New York',
        district: 'Manhattan',
      },
    }),
    prisma.trainingLocation.create({
      data: {
        state: 'California',
        district: 'San Francisco',
      },
    }),
    prisma.trainingLocation.create({
      data: {
        state: 'Texas',
        district: 'Austin',
      },
    }),
  ])
  console.log(`✓ Created ${locations.length} training locations`)

  // Create stacks
  console.log('Creating stacks...')
  const stacks = await Promise.all([
    prisma.stack.create({
      data: {
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
      },
    }),
    prisma.stack.create({
      data: {
        name: 'Node.js',
        description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
      },
    }),
    prisma.stack.create({
      data: {
        name: 'TypeScript',
        description: 'Typed JavaScript at Any Scale',
      },
    }),
    prisma.stack.create({
      data: {
        name: 'Python',
        description: 'Programming language for general-purpose programming',
      },
    }),
  ])
  console.log(`✓ Created ${stacks.length} stacks`)

  // Get created profiles for training creation
  const organizationProfile = await prisma.organizationProfile.findFirst({
    where: { user: { email: 'organization@example.com' } },
  })
  
  const freelancerProfile = await prisma.freelancerProfile.findFirst({
    where: { user: { email: 'freelancer@example.com' } },
  })

  if (organizationProfile && freelancerProfile) {
    // Create sample trainings
    console.log('Creating sample trainings...')
    const trainings = await Promise.all([
      prisma.training.create({
        data: {
          title: 'React Advanced Training',
          description: 'Advanced React concepts including hooks, context, and performance optimization',
          skills: JSON.stringify(['React', 'JavaScript', 'TypeScript']),
          categoryId: categories[2].id, // Frameworks
          type: 'CORPORATE',
          locationId: locations[1].id, // San Francisco
          stackId: stacks[0].id, // React
          companyName: 'TechCorp Solutions',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-05'),
          paymentTerm: 30,
          paymentAmount: 5000,
          isPublished: true,
          isActive: true,
          organizationId: organizationProfile.id,
          freelancerId: freelancerProfile.id,
          openings: 2,
          experienceMin: 3,
          experienceMax: 5,
        },
      }),
      prisma.training.create({
        data: {
          title: 'Soft Skills Workshop',
          description: 'Improve your communication and teamwork skills',
          skills: JSON.stringify(['Communication', 'Teamwork', 'Leadership']),
          categoryId: categories[0].id, // Soft Skills
          type: 'CORPORATE',
          locationId: locations[0].id, // New York
          stackId: stacks[0].id, // React
          companyName: 'TechCorp Solutions',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-02'),
          paymentTerm: 15,
          paymentAmount: 2000,
          isPublished: true,
          isActive: true,
          organizationId: organizationProfile.id,
          openings: 10,
          experienceMin: 1,
          experienceMax: 3,
        },
      }),
      prisma.training.create({
        data: {
          title: 'Node.js Backend Development',
          description: 'Learn to build scalable backend applications with Node.js',
          skills: JSON.stringify(['Node.js', 'JavaScript', 'Express', 'MongoDB']),
          categoryId: categories[2].id, // Frameworks
          type: 'UNIVERSITY',
          locationId: locations[2].id, // Austin
          stackId: stacks[1].id, // Node.js
          companyName: 'TechCorp Solutions',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-04-03'),
          paymentTerm: 45,
          paymentAmount: 3500,
          isPublished: true,
          isActive: true,
          organizationId: organizationProfile.id,
          freelancerId: freelancerProfile.id,
          openings: 1,
          experienceMin: 4,
          experienceMax: 7,
        },
      }),
    ])
    console.log(`✓ Created ${trainings.length} trainings`)

    // Create sample feedback
    console.log('Creating sample feedback...')
    const feedback = await Promise.all([
      prisma.trainingFeedback.create({
        data: {
          trainingId: trainings[0].id,
          freelancerId: freelancerProfile.id,
          organizationId: organizationProfile.id,
          userId: freelancerProfile.userId,
          organizationRating: 4.5,
          institutionName: 'TechCorp Solutions',
          overallRating: 4.3,
          foodAccommodation: 4.2,
          travelExperience: 4.4,
          paymentTermRating: 4.6,
          comments: 'Great training experience! Very well organized.',
        },
      }),
      prisma.trainingFeedback.create({
        data: {
          trainingId: trainings[1].id,
          freelancerId: freelancerProfile.id,
          organizationId: organizationProfile.id,
          userId: freelancerProfile.userId,
          organizationRating: 4.0,
          institutionName: 'TechCorp Solutions',
          overallRating: 4.1,
          foodAccommodation: 4.0,
          travelExperience: 3.9,
          paymentTermRating: 4.2,
          comments: 'Good workshop, learned a lot about soft skills.',
        },
      }),
    ])
    console.log(`✓ Created ${feedback.length} feedback entries`)
  }

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Test Credentials:')
  console.log('────────────────────────────────────────────────────────────────────────────────')
  console.log('Admin:')
  console.log('  Email: admin@example.com')
  console.log('  Password: admin123')
  console.log('')
  console.log('Freelancer:')
  console.log('  Email: freelancer@example.com')
  console.log('  Password: freelancer123')
  console.log('')
  console.log('Organization:')
  console.log('  Email: organization@example.com')
  console.log('  Password: organization123')
  console.log('')
  console.log('Maintainer:')
  console.log('  Email: maintainer@example.com')
  console.log('  Password: maintainer123')
  console.log('────────────────────────────────────────────────────────────────────────────────')
  console.log('')
  console.log('Note: Passwords are properly hashed using bcrypt for NextAuth authentication.')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })