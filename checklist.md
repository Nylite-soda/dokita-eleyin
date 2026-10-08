# Dókítà Eléyín — Sanity Studio Content Checklist

This checklist details all the data schemas available in the admin studio. Use this guide to gather and input the site contents.

---

## 1. Site Settings (Global Configuration)
*Type: Single Document*
*This contains the global site info, metadata, and contact details displayed on the contact page and footer.*

* [ ] **Site name**: The name of the platform (e.g., `Dókítà Eléyín`).
* [ ] **Site tagline**: Short tag/slogan (e.g., `Bridging the gap in oral health education`). Shown in the about hero.
* [ ] **Default OG image**: Image used for social sharing cards when sharing the site link.
* [ ] **Contact email**: Public email address (e.g., `hello@dokitaeleyin.com`).
* [ ] **Contact phone**: Public phone or WhatsApp number (e.g., `+234 (0) 812 345 6789`).
* [ ] **Address**: Physical office address or location summary (e.g., `Lagos, Nigeria`).
* [ ] **Social handles**:
  * [ ] Instagram account name/handle
  * [ ] TikTok account name/handle
  * [ ] YouTube account name/handle
  * [ ] LinkedIn account name/handle
* [ ] **Footer description text**: A paragraph summarizing the platform's vision, shown at the bottom of all pages.
* [ ] **Our mission**: Mission statement displayed in the mission/vision card layout on the about page.
* [ ] **Our vision**: Vision statement displayed in the mission/vision card layout on the about page.
* [ ] **Core values** (List of items):
  * [ ] Title (e.g., `Empathy`, `Excellence`)
  * [ ] Description (A short sentence describing the value)
* [ ] **Cookie notice text**: Text shown in the cookie banner for privacy compliance.

---

## 2. Homepage Settings
*Type: Single Document*
*Controls the content blocks of the homepage.*

* [ ] **Hero headline**: Main headline visible at the top of the homepage.
* [ ] **Hero subheadline**: Paragraph describing the platform below the main homepage title.
* [ ] **Hero primary CTA**: Primary button details:
  * [ ] Label (e.g., `Book Consultation`)
  * [ ] Link (e.g., `/consultation`)
* [ ] **Hero secondary CTA**: Secondary button details:
  * [ ] Label (e.g., `Our Programs`)
  * [ ] Link (e.g., `/programs`)
* [ ] **Hero background image**: The primary background photo rendered behind the hero block.
* [ ] **Tagline**: Headline for the homepage intro section.
* [ ] **Why we exist title**: Header for the purpose/why-we-exist section.
* [ ] **Why we exist body**: Main descriptive text body under the purpose header.
* [ ] **Featured articles**: Reference list of articles to highlight on the homepage (Select up to 3).
* [ ] **Social proof text**: Small headline for the partners banner (e.g., `Trusted By`).
* [ ] **Newsletter headline**: Heading for the email subscription section.
* [ ] **Newsletter subcopy**: Supporting text below the newsletter heading.
* [ ] **Social feed embed code**: Widget integration script from curator.io or elfsight (leaves empty if using placeholder grid).
* [ ] **Social media links**:
  * [ ] Full Instagram profile URL
  * [ ] Full TikTok profile URL
  * [ ] Full YouTube channel URL

---

## 3. Founder Details
*Type: Single Document*
*Controls information rendered on the founder bio page.*

* [ ] **Full name**: The founder's name (e.g., `Dr. Ibukun`).
* [ ] **Credentials** (List of tags): Education or titles (e.g., `Dental Surgeon`, `Public Health Advocate`).
* [ ] **Photo**: Portrait image of the founder.
* [ ] **Full bio**: Detailed biographical description (supports formatted rich text paragraphs).
* [ ] **Short bio**: Simplified summary used on card callouts or homepage previews.
* [ ] **Social links**:
  * [ ] Instagram profile link
  * [ ] TikTok profile link
  * [ ] LinkedIn profile link
  * [ ] Twitter/X profile link
* [ ] **Featured quote**: Prominent quote displayed on the founder page.

---

## 4. Programs
*Type: Multiple Documents (Create 1 for each program)*
*Oral health programs offered by the platform.*

* [ ] **Program name**: The name of the initiative (e.g., `Bright Smiles School Tour`). *(Required)*
* [ ] **Slug**: Web URL handle (e.g., `bright-smiles-school-tour`). *(Required, click Generate)*
* [ ] **Short description**: Quick summary card text.
* [ ] **Full description**: Complete rich text layout containing paragraphs and headers.
* [ ] **Program type**: Select from the dropdown:
  * `School Initiative`
  * `Community Outreach`
  * `Digital Education`
* [ ] **Images**: Photo gallery related to this program.
* [ ] **Activities** (List of text lines): Key actions or steps of the program (e.g., `Dental screening`, `Toothpaste distribution`).
* [ ] **Status**: Select from the dropdown:
  * `Active`
  * `Completed`
  * `Upcoming`

---

## 5. Partners
*Type: Multiple Documents (Create 1 for each partner)*
*Organizations that support Dókítà Eléyín.*

* [ ] **Organization name**: Name of the partner school, NGO, or corporate sponsor. *(Required)*
* [ ] **Logo**: Image representing the partner brand.
* [ ] **Website URL**: External link to the partner's homepage.
* [ ] **Partnership type**: Select from the dropdown:
  * `School`
  * `NGO`
  * `Corporate`
  * `Healthcare`
  * `Government`
* [ ] **Description**: Brief explanation of the partnership.
* [ ] **Active**: Toggle checkbox to show or hide the partner on the site.

---

## 6. Outreach Events
*Type: Multiple Documents (Create 1 for each event)*
*Field events, community outreach, and school activations.*

* [ ] **Event name**: Title of the event. *(Required)*
* [ ] **Date**: Calendar date of execution. *(Required)*
* [ ] **Location**: Physical location (e.g., `Ikorodu, Lagos`).
* [ ] **Venue type**: Select from the dropdown:
  * `School`
  * `Church`
  * `Community Centre`
  * `Hospital`
  * `Other`
* [ ] **Description**: Summary text describing the event and what was achieved.
* [ ] **Images**: Gallery of photos from the event.
* [ ] **Number of people reached**: Number showing community size/attendance (e.g., `1200`).
* [ ] **Google Maps embed URL**: Src link from Google Maps share embed frame.
* [ ] **Featured on homepage**: Checkbox to spotlight this event on the main page.

---

## 7. Impact Stats
*Type: Multiple Documents (Create 1 for each counter)*
*Numerical statistics rendering on the homepage and impact page.*

* [ ] **Label**: Name of the stat (e.g., `Individuals Reached`). *(Required)*
* [ ] **Value**: Number count (e.g., `5000`). *(Required)*
* [ ] **Icon name**: Key name matching a Tabler icon. Supported choices:
  * `ti-users` (People icon)
  * `ti-school` (School building icon)
  * `ti-checklist` (Checklist icon)
  * `ti-gift` (Giftbox icon)
  * `ti-mobile` (Phone icon)
  * `ti-building` (Building icon)
* [ ] **Sort order**: Sequence placement number.

---

## 8. Impact Stories
*Type: Multiple Documents (Create 1 for each feedback)*
*Testimonials from teachers, students, or community leaders.*

* [ ] **Person name**: Name of the storyteller. *(Required)*
* [ ] **Role**: Association (e.g., `School Head Teacher`, `Primary 5 Student`).
* [ ] **Photo**: Profile photo of the person.
* [ ] **Story**: The testimonial quote or written text paragraphs.
* [ ] **Location**: Town or region (e.g., `Yaba, Lagos`).
* [ ] **Featured**: Checkbox to spotlight this story on the impact page.

---

## 9. Frequently Asked Questions (FAQs)
*Type: Multiple Documents (Create 1 for each FAQ)*
*Help center queries.*

* [ ] **Question**: The FAQ query. *(Required)*
* [ ] **Answer**: Paragraph response in formatted rich text. *(Required)*
* [ ] **Category**: Select from the dropdown:
  * `General`
  * `Consultation`
  * `Programs`
  * `Partnerships`
* [ ] **Sort order**: Sequence placement number.

---

## 10. Learning Categories
*Type: Multiple Documents (Create 1 for each article group)*
*Categories to group learning hub articles.*

* [ ] **Name**: Category title (e.g., `Children's Oral Health`, `Daily Dental Care`). *(Required)*
* [ ] **Slug**: URL identifier (e.g., `childrens-oral-health`). *(Required, click Generate)*

---

## 11. Learning Hub Articles
*Type: Multiple Documents (Create 1 for each article)*
*Educational content, oral health tips, and blog posts.*

* [ ] **Title**: Heading of the article. *(Required)*
* [ ] **Slug**: URL handle (e.g., `importance-of-flossing`). *(Required, click Generate)*
* [ ] **Excerpt**: Summary description shown in list cards (maximum 150 characters).
* [ ] **Body**: Main article contents (supports paragraphs, headings, blockquotes, and inline images).
* [ ] **Category**: Reference category link (Select from created Categories).
* [ ] **Tags** (List of tags): Keywords (e.g., `teeth whitening`, `kids hygiene`).
* [ ] **Featured image**: Large banner cover photo.
* [ ] **SEO title**: Optional metadata title.
* [ ] **SEO description**: Optional metadata description paragraph.
* [ ] **Featured article**: Toggle checkbox to highlight this article at the top of the hub.
* [ ] **Published at**: Date and time of publication.
