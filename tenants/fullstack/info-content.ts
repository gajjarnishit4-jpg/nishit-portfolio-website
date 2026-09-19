export type InfoPageContent = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  accent: string;
  stat: string;
  statLabel: string;
  sections: {
    title: string;
    body: string;
    points?: string[];
  }[];
};

export const infoPages: Record<string, InfoPageContent> = {
  about: {
    slug: "about",
    eyebrow: "ABOUT NISHIT GAJJAR",
    title: "One independent full-stack freelancer for projects that need more than a template.",
    intro:
      "The Fullstack Guys is Nishit Gajjar's personal portfolio and project brand. Nishit works directly with founders and businesses that care about product, taste, speed, and practical results.",
    accent: "#b7ef66",
    stat: "MR.",
    statLabel: "Nishit Gajjar — independent freelancer behind The Fullstack Guys",
    sections: [
      {
        title: "The origin story",
        body:
          "Nishit started The Fullstack Guys after seeing good businesses trapped inside forgettable templates, fragile tools, and disconnected workflows. He brings brand, UX, software, automation, conversion thinking, and build quality into one direct working relationship.",
      },
      {
        title: "How Nishit works",
        body:
          "Nishit personally leads the strategy, design direction, engineering, and launch planning. There is no maze of account managers or handoffs: you speak with the person responsible for the work and keep decisions visible from first scope to launch.",
        points: [
          "Direct communication with Nishit throughout the project.",
          "Design decisions grounded in usability and conversion.",
          "Engineering, scope, timing, and quality owned in one place.",
        ],
      },
      {
        title: "What Nishit believes",
        body:
          "Technology should make a business feel sharper, not heavier. Whether it is a public website, mobile app, Shopify system, dashboard, or automation layer, it should be easy to trust, easy to use, and hard to forget.",
      },
    ],
  },
  process: {
    slug: "process",
    eyebrow: "PROCESS",
    title: "Clear milestones, fast feedback, no handoff fog.",
    intro:
      "Nishit's process is built around momentum across web, software, mobile, commerce, and automation work. You always know what is being decided, what is being made, and what comes next.",
    accent: "#8bdcff",
    stat: "4",
    statLabel: "core phases from first call to launch support",
    sections: [
      {
        title: "01. Discover",
        body:
          "Nishit maps your business, users, current website or product, workflows, customer objections, technical constraints, references, timeline, and budget. The goal is to find the commercial and technical shape of the project before design starts.",
      },
      {
        title: "02. Direction",
        body:
          "Nishit defines the product lane with you: information architecture, user journeys, interface feel, content priorities, data needs, integrations, and technical architecture. This keeps design exciting without becoming random.",
      },
      {
        title: "03. Design and build",
        body:
          "Nishit moves through approved sections, screens, features, and milestones. You can pay by milestone, review work in stages, and keep decisions practical. Flexible payment modes are accepted.",
      },
      {
        title: "04. Launch and support",
        body:
          "After launch, Nishit includes 3 months of support for reasonable fixes, guidance, and polish related to the delivered scope.",
      },
    ],
  },
  pricing: {
    slug: "pricing",
    eyebrow: "PRICING AND TRUST",
    title: "Custom digital work starts at $2,000. Payment can stay flexible.",
    intro:
      "Most focused websites, commerce builds, app prototypes, dashboards, automations, and software sprints start around $2,000 USD and can scale to $10,000+ depending on depth, integrations, screens, apps, and launch speed.",
    accent: "#ffb7db",
    stat: "$2k",
    statLabel: "starting point for focused custom technology work",
    sections: [
      {
        title: "Direct projects",
        body:
          "Working directly with Nishit keeps communication and budget clear. He accepts flexible payment modes and milestone payments, so websites, apps, software, and commerce projects can move in practical stages instead of one heavy payment.",
        points: [
          "Milestone payments accepted for design, build, and launch.",
          "Scope can be shaped for early-stage teams without killing quality.",
          "The quote is always tied to deliverables, not mystery hours.",
        ],
      },
      { title: "Before you pay", body: "Your written quote identifies Nishit Gajjar as the independent service provider and states the currency, scope, payment stages, agreed fees, and any applicable charges. Ask for clarification before paying if any detail is inconsistent." },
    ],
  },
  support: {
    slug: "support",
    eyebrow: "SUPPORT",
    title: "Launch is not the end of the relationship.",
    intro:
      "Nishit stays close after handoff so you can settle into the new site, catch small issues, and keep moving without panic.",
    accent: "#c8b5ff",
    stat: "3",
    statLabel: "months of included post-launch support",
    sections: [
      {
        title: "Included support",
        body:
          "For 3 months after launch, Nishit helps with reasonable bug fixes, CMS or admin guidance, light polish, and questions related to the delivered scope.",
      },
      {
        title: "What happens after",
        body:
          "After the support period, you can book small improvement blocks, conversion work, new sections, landing pages, app updates, automations, integrations, or a monthly maintenance plan if your digital system needs ongoing care.",
      },
      {
        title: "How to reach Nishit",
        body:
          "Use the website inquiry form, WhatsApp, or discovery-call booking flow to contact Nishit Gajjar directly. The Fullstack Guys is Nishit's personal portfolio and project brand, not a separate company or agency.",
      },
    ],
  },
  "privacy-policy": {
  "slug": "privacy-policy",
  "eyebrow": "PRIVACY POLICY",
  "title": "Your information. Clear purposes. One named individual.",
  "intro": "Privacy policy for The Fullstack Guys, Nishit Gajjar's personal freelancer website. Last updated: 19 September 2026. This notice describes information handled when you browse, ask a question, request a quote, or engage Nishit's digital services.",
  "accent": "#64e6c0",
  "stat": "Your choice",
  "statLabel": "No sale of personal information; no optional ad tracking in this version",
  "sections": [
    {
      "title": "01. Who is responsible",
      "body": "Nishit Gajjar is the individual freelancer responsible for this website and its inquiry data. The Fullstack Guys is Nishit's personal portfolio and project brand, not a separate company or agency. For privacy requests, corrections, complaints, or project support, contact Nishit through the website inquiry form or WhatsApp and state that your request concerns The Fullstack Guys."
    },
    {
      "title": "02. Information you provide",
      "body": "Nishit processes information you choose to submit through the inquiry form or automated chat, when booking a call, or when commissioning work. Please provide only information needed for your inquiry.",
      "points": [
        "Contact and inquiry details: name, email, phone or WhatsApp number, company, industry, website, budget, requirements, expected timeline, and correspondence.",
        "Project records: proposals, agreed scope, approvals, files, account-access invitations, invoices, payment confirmations, and support communications.",
        "Chat content: your messages, replies, and project details inferred from the conversation. Do not enter payment card details, government identity documents, passwords, health information, or other sensitive personal data into chat."
      ]
    },
    {
      "title": "03. Technical information and browser storage",
      "body": "Website requests necessarily include technical information such as IP address, browser or device information, requested URL, and request time. Infrastructure providers may use request logs for delivery, troubleshooting, and security. The interface uses browser storage for chat session continuity, motion preferences, and remembering dismissed panels. These identifiers are not payment credentials. Clearing browser storage resets these preferences but does not delete records already submitted to Nishit."
    },
    {
      "title": "04. Why information is used",
      "body": "Nishit Gajjar uses information to answer your questions, assess requirements, prepare quotes, deliver and support agreed services, administer project records and invoices, investigate problems, and meet applicable record-keeping obligations. Contacting Nishit requests a response to that inquiry; it does not enroll you in a newsletter. Nishit does not sell personal information or use inquiry submissions as permission for unrelated promotional campaigns. Where consent is required, it is requested for the relevant purpose and can be withdrawn."
    },
    {
      "title": "05. Automated chat and human review",
      "body": "The site provides an automated project assistant, not a human adviser. When an AI provider is configured, message history may be processed by Groq to generate replies and summarize requirements; Hugging Face may classify inquiry intent if configured. Nishit may review saved conversations and inquiry details to respond and provide support. Automated summaries or scores help organize inquiries; they do not determine a binding price, credit eligibility, or other legal entitlement. Ask Nishit to review inaccurate responses. When AI services are unavailable, the assistant uses a rules-based fallback."
    },
    {
      "title": "06. Service providers and external links",
      "body": "Where configured for service delivery, providers may process information for databases and analytics (Supabase), AI responses (Groq), intent classification (Hugging Face), infrastructure, email, and business administration. Website analytics can include a pseudonymous visitor and session identifier, pages viewed, clicks, scroll depth, form interaction state without field values, performance measurements, device and browser details, referral and campaign parameters, approximate region supplied by infrastructure, and a one-way hash derived from an IP address. Contact details and message content are stored only when you choose to submit them. Only information needed for the relevant task should be shared. Opening a portfolio website takes you to an independently operated service with its own privacy practices. Portfolio media on this site is served from this site’s own asset paths. External links do not imply endorsement or ownership by Nishit Gajjar."
    },
    {
      "title": "07. Advertising, cookies, and tracking choices",
      "body": "This version does not load Meta or OpenAI advertising pixels or send server-side advertising conversion events. The site may record first-party activity such as page views, clicks, scroll depth, approximate device type, session identifiers, requested paths, and chat or inquiry interactions to understand performance, prevent abuse, and improve service delivery. Seeing or clicking an ad on another platform is governed by that platform’s privacy settings. If optional third-party advertising measurement is introduced later, this notice will identify the data and recipients, and consent will be obtained where required before activation. Declining optional advertising tracking must not prevent you from reading policies or contacting Nishit."
    },
    {
      "title": "08. Access to client systems",
      "body": "For an agreed project Nishit may need limited access to a website, store, repository, domain, or other business system. Use individual collaborator invitations and the least access needed; do not send passwords in chat. Nishit uses that access for the agreed work and coordinates removal at handoff. If customer personal data is handled on your instructions, additional written confidentiality or data-processing terms may be needed before access is granted."
    },
    {
      "title": "09. Storage, transfers, and disclosure",
      "body": "Information may be processed in India or in countries where selected providers operate. Before using providers for personal data, Nishit assesses the purpose, access requirements, and applicable transfer safeguards. Information may be disclosed when legally required, to respond to a valid legal request, or when necessary to investigate misuse or protect rights. Not all provider systems are necessarily located in India."
    },
    {
      "title": "10. Retention and deletion",
      "body": "Inquiry and chat records are retained only as needed to respond, manage an active relationship, handle disputes, and satisfy applicable obligations. Nishit reviews continued need when a request is closed or a deletion request is received. Project, invoice, tax, and dispute records may need longer retention than a sales inquiry. Deletion may be delayed where a lawful retention obligation applies or backups must expire through their normal cycle. Any relevant limitation will be explained when responding to your request; this notice does not promise an automatic deletion timer."
    },
    {
      "title": "11. Your choices and requests",
      "body": "You may ask what personal information Nishit holds about you, request correction or deletion, withdraw consent for consent-based uses, ask to stop promotional contact, or raise a grievance. Nishit may request proportionate verification before disclosing or changing a record; do not send identity documents unless a secure, necessary method is agreed. Withdrawal does not invalidate earlier lawful processing or prevent records required by law from being retained. Applicable rights, procedures, and escalation options depend on the law in force. Contact Nishit using the details in this policy; you may also approach an authority or forum available under applicable law."
    },
    {
      "title": "12. Security and children",
      "body": "Nishit aims to restrict access to authorized services and use appropriate security controls for the information involved. No system can promise absolute security. Report suspected unauthorized access through the support form promptly. The service is intended for adults able to enter a contract and authorized business representatives, not children under 18. If you believe a child has submitted personal information, contact Nishit so it can be investigated and removed where appropriate."
    },
    {
      "title": "13. Complaints, contact, and policy changes",
      "body": "For privacy requests, corrections, complaints, or project support, contact Nishit Gajjar through the website inquiry form or WhatsApp. State that your request concerns The Fullstack Guys and include the relevant page or service, a description of the issue, and your preferred reply method. Nishit will review requests and respond within the time required by applicable law. Material changes will be reflected here with an updated date; a new purpose requiring consent will not be activated merely by changing this text."
    }
  ]
},
  "refund-policy": {
  "slug": "refund-policy",
  "eyebrow": "REFUND POLICY",
  "title": "Fair cancellation and refund terms.",
  "intro": "Refund policy for digital services supplied personally by independent freelancer Nishit Gajjar through The Fullstack Guys. Last updated: 19 September 2026. This policy is subject to your project agreement and rights that cannot be excluded under applicable law.",
  "accent": "#ffdd55",
  "stat": "Fair review",
  "statLabel": "Completed work, unused funds, and legal rights all count",
  "sections": [
    {
      "title": "01. Who supplies the service",
      "body": "Nishit Gajjar supplies the services personally as an independent freelancer. The Fullstack Guys is Nishit's portfolio and project brand, not a separate company or agency."
    },
    {
      "title": "02. Before work begins",
      "body": "If you cancel before work begins, request return of unused funds. Any deduction must relate to an actual, reasonable, non-recoverable cost that was disclosed and authorized; Nishit will explain the calculation and will not use an undisclosed blanket administrative charge."
    },
    {
      "title": "03. After a project has started",
      "body": "Nishit assesses work completed against agreed milestones and the usable deliverables provided. Payment for correctly completed and accepted work is normally retained, subject to defects and mandatory rights. Unused prepaid amounts for undelivered work are considered for refund after any agreed, lawful, documented deductions. Nishit provides an explanation rather than relying solely on a non-refundable label."
    },
    {
      "title": "04. If work does not meet scope",
      "body": "Report the issue with the agreed requirement and relevant examples. Where appropriate, Nishit will offer a reasonable correction period. If the agreed service cannot be supplied or a material problem cannot be resolved, a proportionate refund, cancellation, or another remedy may be due under the contract and applicable law. Acceptance does not waive remedies that cannot legally be waived."
    },
    {
      "title": "05. External costs and marketplace orders",
      "body": "Domains, licenses, hosting, themes, platform charges, and other third-party costs follow their provider’s terms. Nishit will identify costs already committed with your approval and pursue any available recovery where appropriate. Fiverr or Upwork orders also follow the platform’s dispute and payment process. Neither platform rules nor this policy remove non-excludable rights."
    },
    {
      "title": "06. Requests and payment of refunds",
      "body": "For a cancellation or refund request, contact Nishit Gajjar through the website inquiry form or WhatsApp and state that it concerns The Fullstack Guys. Include the invoice or project reference, payment date, issue, and requested resolution. Do not send full card or account credentials. Nishit will confirm the outcome and, for an approved refund, the amount, payment route, and expected processing time in writing. Refunds normally return through the original payment method where available; provider processing times vary."
    },
    {
      "title": "07. Support, delays, and changes",
      "body": "Contact Nishit promptly about delays or defects. He will review who controls the delay and its effect on delivery. Client changes or missing materials may require a revised schedule or quote, but do not automatically forfeit all unused funds. The advertised support period and any specific remedies are defined in your project agreement. Statutory remedies remain available."
    }
  ]
},
  "terms-of-use": {
  "slug": "terms-of-use",
  "eyebrow": "TERMS OF USE",
  "title": "Clear terms for working directly with Nishit Gajjar.",
  "intro": "Terms of use for The Fullstack Guys. Last updated: 17 September 2026. These terms explain website use and the basis on which digital services are proposed and delivered. Read these together with the privacy and refund policies and your written project agreement.",
  "accent": "#ff9068",
  "stat": "NISHIT",
  "statLabel": "GAJJAR — independent freelancer behind The Fullstack Guys",
  "sections": [
    {
      "title": "01. Individual identity and contracting party",
      "body": "Nishit Gajjar is the individual freelancer operating this website and supplying direct services. The Fullstack Guys is Nishit's personal portfolio and project brand, not a separate company, agency, or contracting entity. Quotes, agreements, payment instructions, and invoices for direct projects identify Nishit Gajjar as the service provider."
    },
    {
      "title": "02. Website use and eligibility",
      "body": "You may browse and submit a genuine inquiry without purchasing. To commission services you must be at least 18, have capacity to contract, and have authority to act for any organization you represent. Do not impersonate others, submit deceptive material, attempt unauthorized access, disrupt the site, or use the service for unlawful activities."
    },
    {
      "title": "03. Services and project agreements",
      "body": "Services include website design and development, commerce integrations, software, apps, automation, design, and agreed support. A project starts only after written agreement on scope, price, payment schedule, deliverables, dependencies, timelines, revisions, and acceptance arrangements. A website visit, inquiry, automated chat reply, or calendar booking is not acceptance of a paid contract. A specific written agreement controls over general website statements for that project, subject to mandatory law."
    },
    {
      "title": "04. Prices and payment identity",
      "body": "Displayed starting prices are indicative starting points in USD, not a promise that every project is available at that price. Before payment, the written quote must state the final scope, currency, applicable charges, due dates, and recurring third-party costs. Verify that the quote, invoice, and authorized payment beneficiary identify Nishit Gajjar; query inconsistent instructions before paying. The website chat does not collect card numbers or banking passwords."
    },
    {
      "title": "05. Offers and discounts",
      "body": "A displayed promotional code is a request to apply the advertised discount to eligible new work. Where the 30% new-project offer is used, the written quote must show the ordinary eligible service fee, discount, and final payable amount before you commit. It does not apply to taxes, ad spend, third-party subscriptions, marketplace charges, or existing work, and cannot be combined with other offers unless agreed. A code is not cash, a booking guarantee, or a payment receipt. Nishit will explain eligibility before accepting payment and will not silently replace an agreed price."
    },
    {
      "title": "06. Milestones, timelines, and revisions",
      "body": "Work is delivered against agreed stages. Review each stage within the written review period and describe any gap against scope. Silence does not automatically waive a defect or statutory remedy. New features or substantial direction changes require a written change to cost and timing. Schedules depend on timely access, content, approvals, and third-party availability; Nishit communicates material delays and their impact."
    },
    {
      "title": "07. Client materials and system access",
      "body": "You must have permission to provide content, images, trademarks, data, and system access. Supply accurate requirements and lawful materials, and grant only necessary access through secure invitations. Both parties should protect confidential information and avoid unnecessary collection or disclosure of personal data. You remain responsible for decisions about your products and business claims; Nishit remains responsible for his agreed professional work."
    },
    {
      "title": "08. AI-assisted answers",
      "body": "The website assistant helps explain services and collect requirements. It may make mistakes and is not legal, tax, financial, or other regulated advice. Automated estimates, summaries, or statements are not binding project commitments; obtain written confirmation directly from Nishit Gajjar before making a purchase."
    },
    {
      "title": "09. Intellectual property and confidentiality",
      "body": "Your existing materials remain yours. Rights in final custom deliverables are transferred or licensed as specified in your agreement after applicable payment. Pre-existing tools, reusable components, open-source code, and third-party assets remain subject to their owners’ rights and licenses, which must be disclosed where relevant to use. Neither party may disclose the other’s confidential information except for authorized delivery or a lawful requirement. Public portfolio use of confidential work or your brand requires appropriate permission."
    },
    {
      "title": "10. External platforms and profiles",
      "body": "Marketplace orders are also subject to that platform’s payment, dispute, and cancellation rules. External profiles, portfolios, and review pages belong to their stated account holders; a link is not a claim that a platform endorses Nishit Gajjar. Third-party hosting, domains, themes, apps, and software may carry separate charges or limitations. Nishit remains accountable for his contractual obligations and will not use a third-party issue to exclude rights that cannot lawfully be excluded."
    },
    {
      "title": "11. Cancellation, refunds, and incomplete work",
      "body": "You may request cancellation through the published contact options. The refund policy explains how completed work, unused funds, non-recoverable authorized costs, and failures to meet agreed scope are assessed. If Nishit cannot deliver agreed work, he will discuss correction, revised delivery, cancellation, and any refund due. No approved milestone or cancellation term removes mandatory consumer rights or remedies for defective services, fraud, or misrepresentation."
    },
    {
      "title": "12. Support and handoff",
      "body": "The advertised three months of post-launch support covers reasonable bug fixes and questions within the delivered scope. The project agreement should define the launch date, support channel, response expectations, and exclusions before payment. New functionality, redesigns, ongoing campaigns, and third-party subscriptions require separate agreement. At handoff, Nishit provides agreed files and access and coordinates removal of access no longer required."
    },
    {
      "title": "13. Honest claims and independent platform decisions",
      "body": "Nishit does not guarantee revenue, search rankings, conversion rates, traffic, advertising results, ad-account approval, or approval by ChatGPT, OpenAI, or any other platform. Names and examples describe services or independent platforms, not a claim of endorsement or partnership. Advertising must accurately identify Nishit Gajjar, the offer, location, and destination; platform eligibility and review decisions remain with the platform."
    },
    {
      "title": "14. Responsibility and lawful limitations",
      "body": "Each party is responsible for losses arising from its breach as determined under the agreement and applicable law. Any negotiated liability cap must be stated in the written project agreement and is effective only to the extent permitted by law. Nothing in these terms excludes or limits liability or rights that cannot legally be excluded, including mandatory consumer remedies and liability for fraud or wilful misconduct."
    },
    {
      "title": "15. Suspension and termination",
      "body": "Nishit may suspend work for material non-payment, security risks, unlawful requests, or a material contractual breach, with notice and a reasonable opportunity to resolve the issue where practicable. Urgent security issues may require immediate action. Ending a project does not erase refund obligations, accrued payment obligations, confidentiality, or rights in already paid deliverables. Any handoff or unused funds will be addressed fairly under the project agreement and applicable law."
    },
    {
      "title": "16. Complaints, governing law, and changes",
      "body": "For privacy requests, corrections, complaints, or project support, contact Nishit Gajjar through the website inquiry form or WhatsApp and state that your request concerns The Fullstack Guys. Indian law applies, subject to mandatory protections and jurisdiction rules that apply to you. Written discussion is encouraged first, but this does not restrict access to a competent court, consumer forum, regulator, or other remedy available by law. Updates apply prospectively; changes to a signed project require agreement and do not silently rewrite previously accepted terms."
    }
  ]
},
};
