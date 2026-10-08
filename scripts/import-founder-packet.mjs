import { randomUUID } from 'node:crypto'

process.loadEnvFile('.env.local')
const { getPrisma } = await import('../src/lib/prisma.ts')
const db = getPrisma()
const apply = process.argv.includes('--apply')
const now = new Date().toISOString()
const links = {
  instagram: 'https://www.instagram.com/dokita_eleyin_1?stkn=YzRuOTM1emZhcGRn',
  tiktok: 'https://vm.tiktok.com/ZMkoRY17v/',
  twitter: 'https://x.com/dokita_eleyin_1/status/1892896327631020200?t=iThg0D6Vl8CucUsFriu14w&s=08',
  facebook: 'https://www.facebook.com/share/v/1FBWpBYKow/',
}

function paragraphs(values) {
  return values.map((text, index) => ({
    _type: 'block', _key: `packet-p-${index}`, style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: `packet-s-${index}`, text, marks: [] }],
  }))
}

const founderCopy = {
  fullName: 'Dr. Ibukun Adamaigbo',
  title: 'Founder, dókítà Eléyín | Dental Surgeon | Oral Healthcare Consultant | Public Health Advocate',
  credentials: [
    'Bachelor of Dental Surgery (BDS)',
    'Oral healthcare communicator and advocate',
    "Public Health / Health Policy & Management Master's student",
    'Researcher with interests in oral health, health systems, health equity and access to care',
  ],
  shortBio: 'Dr. Ibukun Adamaigbo is a Dental Surgeon, public health advocate and founder of dókítà Eléyín, a Yoruba-language oral health education platform that makes evidence-based oral health information simple, relatable and accessible. Through digital education and community outreach, her work has reached over one million people and continues to promote prevention, health equity and better access to oral healthcare.',
  bio: paragraphs([
    'Dr. Ibukun Adamaigbo is a Nigerian Dental Surgeon, oral healthcare communicator and advocate, public health advocate and founder of dókítà Eléyín, a digital oral health education platform created to make accurate, practical and culturally relevant oral health information accessible to everyone.',
    'With over five years of clinical experience, Dr. Adamaigbo has worked across clinical dentistry, public-sector healthcare, research and community oral health initiatives. Her professional journey has given her a strong understanding of the gap between what people know about their health and what they are actually able to access and practise. This experience shaped her passion for taking healthcare education beyond the dental clinic and bringing it directly to communities.',
    "Through dókítà Eléyín, she uses Yoruba-language education, storytelling, humour and relatable everyday conversations to challenge harmful health myths and make oral health easier to understand and practise. The platform addresses issues ranging from children's oral health and preventive dentistry to toothache myths, oral hygiene, gum health and appropriate use of dental services.",
    'Her work has reached over one million people through social media, while her community outreach activities continue to provide oral health education and engagement to individuals, children, young people and families. She is particularly passionate about prevention, health equity, community engagement and creating healthcare education that people can understand, trust and act upon.',
    'Beyond dentistry, Dr. Adamaigbo is developing her expertise in public health, with a focus on health policy and management, and is interested in research and interventions that strengthen health systems and improve access to quality healthcare.',
    'Her long-term vision is to build dókítà Eléyín into a global platform that uses culturally relevant health communication and community-centred approaches to improve oral health outcomes, particularly among underserved populations.',
  ]),
  featuredQuote: '“Everyone deserves to understand their health in a language they can connect with, and everyone deserves the opportunity to act on that knowledge.”',
  additionalQuote: '“We are not just teaching people to brush their teeth; we are changing how communities understand, value and take ownership of their oral health.”',
}

const faqItems = [
  { category: 'general', question: 'What is dókítà Eléyín?', answer: 'dókítà Eléyín is an oral health education and advocacy platform founded by Dr. Ibukun Adamaigbo. The platform makes evidence-based oral health information simple, relatable and culturally relevant, with a particular focus on Yoruba-language health education. Through social media, community outreach and educational programmes, dókítà Eléyín helps individuals and communities better understand their oral health and make informed decisions about their care.' },
  { category: 'general', question: 'Why was dókítà Eléyín created?', answer: 'dókítà Eléyín was created from a desire to take oral health education beyond the dental clinic. Many people encounter oral health information through family traditions, social media and cultural beliefs, some of which may be inaccurate or harmful. The platform was created to provide trustworthy information in a way that people can understand, relate to and use in their everyday lives.' },
  { category: 'general', question: 'Who does dókítà Eléyín serve?', answer: 'The platform serves children, teenagers, adults, parents, caregivers, families, schools and communities. While much of the communication is designed for Nigerian and Yoruba-speaking audiences, the broader vision is to make culturally relevant oral health education accessible to communities globally.' },
  { category: 'general', question: 'Is dókítà Eléyín only about dentistry?', answer: "No. Dentistry is the foundation, but the broader mission is health education, prevention, community empowerment and health equity. The platform is interested in how health information, culture, behaviour, access to care and health systems interact to influence people's health outcomes." },
  { category: 'consultation', question: 'Can I book a dental or oral health consultation?', answer: 'Yes. dókítà Eléyín provides oral health consultation services for individuals seeking professional guidance on concerns such as toothache, oral hygiene, children\'s oral health, family oral health education and second opinions. Consultation options and booking information are available through the official consultation booking platform.' },
  { category: 'consultation', question: 'Can I get a diagnosis online?', answer: 'Online consultation can provide professional guidance, education and preliminary assessment, but it cannot replace a physical dental examination where one is clinically necessary. Some dental conditions require an in-person examination, dental imaging or other investigations before a definitive diagnosis and treatment plan can be made.' },
  { category: 'consultation', question: 'When should I see a dentist urgently?', answer: 'Seek urgent dental care when you experience severe or persistent tooth pain, facial or mouth swelling, trauma to the teeth or jaw, uncontrolled bleeding, difficulty swallowing or breathing, fever associated with dental symptoms, or rapidly worsening symptoms.' },
  { category: 'programs', question: 'Does dókítà Eléyín organise school oral health programmes?', answer: "Yes. School and community oral health education is an important part of the platform's work. Programmes can include age-appropriate oral health talks, interactive education, oral health screening or examination where appropriate, practical demonstrations and feedback for parents or caregivers." },
  { category: 'programs', question: 'Can dókítà Eléyín visit our school or community?', answer: 'Yes. Schools, community organisations and other relevant groups can reach out to discuss an oral health education or outreach programme. Each programme can be designed around the needs, age group and context of the community being served.' },
  { category: 'programs', question: 'What topics can be covered during an outreach programme?', answer: 'Topics can include toothbrushing techniques, prevention of tooth decay, gum health, children\'s oral health, healthy eating, dental myths and misconceptions, toothache and appropriate responses, dental visits, oral hygiene, adolescent oral health and the importance of early dental care, with room for questions.' },
  { category: 'partnerships', question: 'Can organisations partner with dókítà Eléyín?', answer: 'Yes. dókítà Eléyín welcomes meaningful partnerships with organisations, schools, healthcare institutions, brands, community organisations, researchers and other stakeholders interested in improving health education and community wellbeing.' },
  { category: 'partnerships', question: 'What types of partnerships are possible?', answer: 'Partnerships may include community outreach programmes, school health initiatives, oral health education campaigns, research and knowledge translation, health communication campaigns, educational content, sponsorships, public awareness initiatives and programmes designed to reach underserved communities.' },
  { category: 'partnerships', question: 'How can an organisation support dókítà Eléyín?', answer: 'Organisations can support the platform through financial sponsorship, programme funding, educational materials, oral health products, technical expertise, research collaboration, community mobilisation or other resources that contribute directly to sustainable health education and community impact.' },
  { category: 'partnerships', question: 'How can we partner with dókítà Eléyín?', answer: 'Organisations interested in partnering can contact the team with details of their organisation, proposed area of collaboration and intended audience or community. The dókítà Eléyín team can then explore opportunities for a partnership aligned with the platform\'s mission and community needs.' },
]

const stats = [
  { label: 'People reached through social media', value: 1_000_000, suffix: '+', icon: 'ti-users', sortOrder: 1 },
  { label: 'People reached through community outreach this year', value: 100, suffix: '+', icon: 'ti-users', sortOrder: 2 },
  { label: 'Years of clinical dental experience', value: 5, suffix: '+', icon: 'ti-checklist', sortOrder: 3 },
  { label: 'Platforms reaching audiences across digital communities', value: 6, suffix: '+', icon: 'ti-mobile', sortOrder: 4 },
]

const stories = [
  {
    name: 'The International School Ibadan', role: 'School outreach', location: 'Ibadan', isFeatured: true,
    story: paragraphs([
      'I attended ISI, and it was really great to be back to give back to the teachers who taught me through an oral health talk and free scaling and polishing.',
      'I still receive thank-you greetings almost 10 months later.',
    ]),
  },
  {
    name: "God's Love Tabernacle", role: 'Community oral health outreach', isFeatured: true,
    story: paragraphs([
      'The outreach reached over 60 people with an oral health talk. About 48 people received either scaling and polishing or an extraction at no cost.',
    ]),
  },
]

function read(row) { try { return JSON.parse(row.data) } catch { return {} } }
function publicData(row) { try { return JSON.parse(row.published_data ?? row.data) } catch { return {} } }
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).filter(key => !['_updatedAt', '_rev'].includes(key)).sort().map(key => [key, canonical(value[key])]))
}
function same(a, b) { return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b)) }

try {
  const [documents, admin] = await Promise.all([
    db.cms_documents.findMany(),
    db.users.findFirst({ where: { role: 'admin', active: 1 }, select: { id: true }, orderBy: { created_at: 'asc' } }),
  ])
  if (apply && !admin) throw new Error('No active CMS administrator is available to attribute this content import.')

  const findSingleton = type => documents.find(row => row.type === type)
  const homeRow = findSingleton('homepageSettings')
  const siteRow = findSingleton('siteSettings')
  const founderRow = findSingleton('founder')
  const home = homeRow ? read(homeRow) : {}
  const site = siteRow ? read(siteRow) : {}
  const founder = founderRow ? read(founderRow) : {}
  const photo = founder.photo ?? home.heroImage
  const mergedLinks = previous => ({ ...(previous ?? {}), ...links })
  const founderData = {
    ...founder, _id: founderRow?.id ?? randomUUID(), _type: 'founder', _createdAt: founder._createdAt ?? now, _updatedAt: now,
    ...founderCopy, ...(photo ? { photo } : {}), socialLinks: mergedLinks(founder.socialLinks),
  }
  const homeData = {
    ...home, _id: homeRow?.id ?? randomUUID(), _type: 'homepageSettings', _createdAt: home._createdAt ?? now, _updatedAt: now,
    socialLinks: mergedLinks(home.socialLinks),
    socialProofText: 'Yoruba-language oral health education makes evidence-based health information culturally relevant and accessible.',
  }
  const siteData = {
    ...site, _id: siteRow?.id ?? randomUUID(), _type: 'siteSettings', _createdAt: site._createdAt ?? now, _updatedAt: now,
    socialHandles: mergedLinks(site.socialHandles),
  }

  const statRows = documents.filter(row => row.type === 'impactStat')
  const statLabels = statRows.map(row => ({ row, label: publicData(row).label }))
  const claimedStatRows = new Set()
  const statDocs = stats.map(stat => {
    const row = statLabels.find(item => !claimedStatRows.has(item.row.id) && [stat.label, ...(stat.sortOrder === 1 ? ['Individuals Reached'] : [])].includes(item.label))?.row
    if (row) claimedStatRows.add(row.id)
    const old = row ? read(row) : {}
    return { row, type: 'impactStat', data: { ...old, _id: row?.id ?? randomUUID(), _type: 'impactStat', _createdAt: old._createdAt ?? now, _updatedAt: now, ...stat } }
  })
  for (const item of statLabels) {
    if (claimedStatRows.has(item.row.id) || !['Schools Visited', 'Kits Distributed'].includes(item.label)) continue
    const old = read(item.row)
    const sortOrder = item.label === 'Schools Visited' ? 5 : 6
    statDocs.push({ row: item.row, type: 'impactStat', data: { ...old, sortOrder, _updatedAt: now } })
    claimedStatRows.add(item.row.id)
  }

  const storyDocs = stories.map(story => {
    const row = documents.find(item => item.type === 'impactStory' && publicData(item).name === story.name)
    const old = row ? read(row) : {}
    return { row, type: 'impactStory', data: { ...old, _id: row?.id ?? randomUUID(), _type: 'impactStory', _createdAt: old._createdAt ?? now, _updatedAt: now, ...story } }
  })
  const faqDocs = faqItems.map((faq, index) => {
    const row = documents.find(item => item.type === 'faq' && publicData(item).category === faq.category && publicData(item).question === faq.question)
    const old = row ? read(row) : {}
    return { row, type: 'faq', data: { ...old, _id: row?.id ?? randomUUID(), _type: 'faq', _createdAt: old._createdAt ?? now, _updatedAt: now, ...faq, answer: paragraphs([faq.answer]), sortOrder: index + 1 } }
  })
  const singletons = [
    { row: founderRow, type: 'founder', data: founderData },
    { row: homeRow, type: 'homepageSettings', data: homeData },
    { row: siteRow, type: 'siteSettings', data: siteData },
  ]
  const plan = [...singletons, ...statDocs, ...storyDocs, ...faqDocs]
  const changes = plan.filter(item => !item.row || !same(read(item.row), item.data))
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', creates: changes.filter(item => !item.row).length, updates: changes.filter(item => item.row).length, founder: founderData.fullName, impactStats: stats.length, retainedLegacyStats: statDocs.length - stats.length, stories: stories.map(story => story.name), faqs: faqItems.length, youtubeProvided: false }, null, 2))
  if (apply && changes.length) {
    await db.$transaction(async tx => {
      for (const item of changes) {
        const data = JSON.stringify(item.data)
        if (item.row) {
          await tx.cms_revisions.create({ data: { id: randomUUID(), document_id: item.row.id, data: item.row.data, status: item.row.status, user_id: admin.id, created_at: now } })
          await tx.cms_documents.update({ where: { id: item.row.id }, data: { data, published_data: data, status: 'published', updated_at: now, updated_by: admin.id, published_at: now } })
        } else {
          await tx.cms_documents.create({ data: { id: item.data._id, type: item.type, slug: null, data, published_data: data, status: 'published', created_at: now, updated_at: now, published_at: now, created_by: admin.id, updated_by: admin.id } })
        }
        await tx.audit_log.create({ data: { id: randomUUID(), user_id: admin.id, action: 'cms.import', target_id: item.data._id, details: JSON.stringify({ type: item.type, source: 'founder-content-packet' }), created_at: now } })
      }
    }, { maxWait: 10_000, timeout: 30_000 })
    console.log(JSON.stringify({ published: changes.length, revisionsCreated: changes.filter(item => item.row).length, databaseChanged: true }))
  }
} finally {
  await db.$disconnect()
}
