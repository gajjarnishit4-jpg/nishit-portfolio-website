export type Project = {
  title: string;
  category: "Commerce" | "Brand Web" | "Software" | "iOS";
  blurb: string;
  metric: string;
  image: string;
  url?: string;
  color: string;
};

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9";

export const projects: Project[] = [
  {
    title: "Lilikiwi",
    category: "Commerce",
    blurb:
      "A playful organic skincare experience made to feel safe for parents and delightful for children.",
    metric: "Shopify storefront",
    image: `${CLOUDINARY_BASE}/open-limits/lilikiwi`,
    url: "https://lilikiwi.fr/en",
    color: "#ffb7db",
  },
  {
    title: "Nerdy Nuts",
    category: "Commerce",
    blurb:
      "Colorful, craveable commerce for a peanut butter brand with a seriously playful personality.",
    metric: "DTC food commerce",
    image: `${CLOUDINARY_BASE}/open-limits/nerdy-nuts`,
    url: "https://nerdynuts.com/",
    color: "#b7ef66",
  },
  {
    title: "Bearaby",
    category: "Commerce",
    blurb:
      "Soft editorial storytelling and effortless shopping for beautifully designed weighted blankets.",
    metric: "Shopify Plus",
    image: `${CLOUDINARY_BASE}/open-limits/bearaby`,
    url: "https://bearaby.com/",
    color: "#8bdcff",
  },
  {
    title: "Hamel's Treats",
    category: "Commerce",
    blurb:
      "Wholesome product storytelling for single-ingredient treats made for very happy dogs.",
    metric: "Pet food commerce",
    image: `${CLOUDINARY_BASE}/open-limits/hamels-treats-v2`,
    url: "https://hamelstreats.com/",
    color: "#ff9068",
  },
  {
    title: "Emani",
    category: "Commerce",
    blurb:
      "A polished beauty destination balancing clinical confidence with modern, inclusive glamour.",
    metric: "Beauty e-commerce",
    image: `${CLOUDINARY_BASE}/open-limits/emani`,
    url: "https://emani.com/",
    color: "#64e6c0",
  },
  {
    title: "Crav Burgers",
    category: "Brand Web",
    blurb:
      "A bold, appetite-first experience with the energy of a cult neighborhood burger spot.",
    metric: "Hospitality website",
    image: "/crav-burgers-website.png",
    url: "https://www.cravburgers.shop/",
    color: "#ffb7db",
  },
  {
    title: "Vol Dog Food",
    category: "Commerce",
    blurb:
      "High-energy pet nutrition commerce built around fresh food, expert guidance and character.",
    metric: "Interactive commerce",
    image: `${CLOUDINARY_BASE}/open-limits/vol-dog-food`,
    url: "https://www.voldogfood.com/",
    color: "#b7ef66",
  },
  {
    title: "Happy Pet",
    category: "Software",
    blurb:
      "A minimal product story that makes smarter pet parenting feel simple and immediately useful.",
    metric: "Digital product launch",
    image: `${CLOUDINARY_BASE}/open-limits/happy-pet`,
    url: "https://happypet.care/",
    color: "#8bdcff",
  },
  {
    title: "Manitobah",
    category: "Commerce",
    blurb:
      "Story-rich commerce celebrating Indigenous design, craft and a global footwear community.",
    metric: "Shopify Plus",
    image: `${CLOUDINARY_BASE}/open-limits/manitobah`,
    url: "https://www.manitobah.com/",
    color: "#ffdd55",
  },
  {
    title: "Seerov",
    category: "Brand Web",
    blurb:
      "A confident, editorial wellness experience built around intention, curiosity and personal freedom.",
    metric: "Wellness commerce",
    image: `${CLOUDINARY_BASE}/open-limits/seerov`,
    url: "https://seerov.com/",
    color: "#ffb7db",
  },
  {
    title: "Sherclan",
    category: "Commerce",
    blurb:
      "Quiet luxury and refined product storytelling for a contemporary Australian jewellery brand.",
    metric: "Luxury e-commerce",
    image: `${CLOUDINARY_BASE}/open-limits/sherclan`,
    url: "https://www.sherclan.com.au/",
    color: "#8bdcff",
  },
  {
    title: "Tato Pow",
    category: "Commerce",
    blurb:
      "A flavor-packed storefront with bold type, tactile product imagery and serious snack energy.",
    metric: "DTC food commerce",
    image: `${CLOUDINARY_BASE}/open-limits/tatopow`,
    url: "https://tatopow.com/",
    color: "#ff9068",
  },
  {
    title: "Articles of Style",
    category: "Brand Web",
    blurb:
      "Premium menswear and bespoke wardrobe expertise translated into a polished consultation journey.",
    metric: "Luxury menswear",
    image: `${CLOUDINARY_BASE}/open-limits/articles-of-style`,
    url: "https://articlesofstyle.com/",
    color: "#c8b5ff",
  },
  {
    title: "Penrose Skin",
    category: "Commerce",
    blurb:
      "Luxury skincare storytelling with a rich product-first homepage and high-intent shopping journey.",
    metric: "Skincare commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/penrose-skin-website-1785014710041.jpg",
    url: "https://penroseskin.com/",
    color: "#64e6c0",
  },
  {
    title: "GODA",
    category: "Brand Web",
    blurb:
      "Modern apparel commerce with a direct, product-led landing experience.",
    metric: "Fashion commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/goda-website-1785014717058.jpg",
    url: "https://godaclothing.com/",
    color: "#8bdcff",
  },
  {
    title: "Thomson Carter",
    category: "Commerce",
    blurb:
      "Premium perfume commerce designed for quick trust, clear offers and sensory brand positioning.",
    metric: "Fragrance commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/thomson-carter-website-1785014720817.jpg",
    url: "https://www.thomsoncarter.com/",
    color: "#ffdd55",
  },
  {
    title: "Anglo Spirit",
    category: "Brand Web",
    blurb:
      "A refined brand storefront with a heritage feel and clear product-led browsing.",
    metric: "Lifestyle commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/anglo-spirit-replacement-1785015351446.png",
    url: "https://anglospirit.com/",
    color: "#ff9068",
  },
  {
    title: "Bay Smokes",
    category: "Brand Web",
    blurb:
      "A bold, conversion-focused ecommerce experience for a high-velocity cannabis category brand.",
    metric: "DTC commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/bay-smokes-replacement-1785015346219.png",
    url: "https://baysmokes.com/",
    color: "#b7ef66",
  },
  {
    title: "Mystery Shirt In A Box",
    category: "Brand Web",
    blurb:
      "Sports apparel commerce built around surprise, gifting and fast purchase intent.",
    metric: "Apparel commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/mystery-shirt-in-a-box-website-1785014731124.jpg",
    url: "https://mysteryshirtinabox.com/",
    color: "#8bdcff",
  },
  {
    title: "Frido",
    category: "Brand Web",
    blurb:
      "Ergonomic product commerce that makes comfort, relief and product education immediately understandable.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/frido-website-1785014735116.jpg",
    url: "https://myfrido.com/",
    color: "#ffb7db",
  },
  {
    title: "Tasty Gains",
    category: "Commerce",
    blurb:
      "Nutrition commerce with a bold product story and simple path from craving to cart.",
    metric: "Food commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/tasty-gains-website-1785014738251.jpg",
    url: "https://tastygains.com/",
    color: "#ffdd55",
  },
  {
    title: "GymProLuxe",
    category: "Brand Web",
    blurb:
      "Fitness product commerce built to explain the kit fast and move shoppers toward a focused offer.",
    metric: "Fitness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/gymproluxe-website-1785014741756.jpg",
    url: "https://www.gymproluxestore.com/",
    color: "#64e6c0",
  },
  {
    title: "SNOW",
    category: "Commerce",
    blurb:
      "Teeth-whitening commerce with a benefit-first layout, trust markers and strong product hierarchy.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/snow-website-1785014745156.jpg",
    url: "https://www.trysnow.com/",
    color: "#8bdcff",
  },
  {
    title: "AnyJob",
    category: "Software",
    blurb:
      "A service marketplace connecting customers, providers, and businesses through bookings and shift work.",
    metric: "Service marketplace",
    image: "/anyjob-website.png",
    url: "https://anyjob-mu.vercel.app/",
    color: "#f3b8b6",
  },
  {
    title: "Resilia",
    category: "Brand Web",
    blurb:
      "A mission-led digital experience built around credibility, outcomes and clear product messaging.",
    metric: "B2B platform",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/resilia-website-1785014752674.jpg",
    url: "https://www.resilia.com/",
    color: "#b7ef66",
  },
  {
    title: "Jennah Organics",
    category: "Commerce",
    blurb:
      "Organic beauty commerce with a clean, direct storefront and product-first shopping path.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/jennah-organics-website-1785014756182.jpg",
    url: "https://jennahorganics.com/",
    color: "#ff9068",
  },
  {
    title: "Sans",
    category: "Commerce",
    blurb:
      "Non-alcoholic drink retail designed around range, choice and fast product discovery.",
    metric: "Drink commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/sans-website-1785014834309.jpg",
    url: "https://sansdrinks.com.au/",
    color: "#ffb7db",
  },
  {
    title: "Setu",
    category: "Brand Web",
    blurb:
      "Supplement commerce built around science-backed messaging and simple wellness navigation.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/setu-website-1785014840319.jpg",
    url: "https://setu.in/",
    color: "#b7ef66",
  },
  {
    title: "AdTok",
    category: "Brand Web",
    blurb:
      "A growth-focused B2B website with clear positioning and direct acquisition messaging.",
    metric: "Agency website",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/adtok-website-1785014845392.jpg",
    url: "https://www.adtok.co/",
    color: "#8bdcff",
  },
  {
    title: "White Lion Labs",
    category: "Brand Web",
    blurb:
      "A focused product and brand experience for a modern performance-led company.",
    metric: "Brand website",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/white-lion-labs-website-1785014850414.jpg",
    url: "https://whitelionlabs.com/",
    color: "#ffdd55",
  },
  {
    title: "HumeHealth",
    category: "Brand Web",
    blurb:
      "Health-tech commerce that makes personal body data feel approachable and actionable.",
    metric: "Health commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/humehealth-website-1785014857429.jpg",
    url: "https://humehealth.com/",
    color: "#c8b5ff",
  },
  {
    title: "Yorkshire Dental Suite",
    category: "Brand Web",
    blurb:
      "A service-led dental website designed to build trust and route visitors into bookings.",
    metric: "Clinic website",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/yorkshire-dental-suite-website-1785014867953.jpg",
    url: "https://www.yorkshiredentalsuite.co.uk/",
    color: "#64e6c0",
  },
  {
    title: "Bloom & Bond",
    category: "Commerce",
    blurb:
      "Hair wellness commerce with direct benefit messaging and product-first conversion design.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/bloom-and-bond-website-1785014874357.jpg",
    url: "https://trybloomandbond.com/",
    color: "#ff9068",
  },
  {
    title: "WeightRx",
    category: "Brand Web",
    blurb:
      "Weight-care commerce with a direct offer structure and conversion-minded product education.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/weightrx-website-1785014880369.jpg",
    url: "https://weightrx.com/",
    color: "#ffb7db",
  },
  {
    title: "Everydaisy",
    category: "Commerce",
    blurb:
      "A feminine beauty storefront with soft brand energy and product-led navigation.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/everydaisy-website-1785014903075.jpg",
    url: "https://everydaisy.com/",
    color: "#c8b5ff",
  },
  {
    title: "Zorvera",
    category: "Commerce",
    blurb:
      "A modern wellness and beauty ecommerce experience with bold trust-building presentation.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/zorvera-website-1785014910600.jpg",
    url: "https://zorvera.com/",
    color: "#64e6c0",
  },
  {
    title: "Sacrasoul",
    category: "Commerce",
    blurb:
      "Aromatics commerce built around ritual, sensory storytelling and a calm path to purchase.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/sacrasoul-website-1785014919172.jpg",
    url: "https://sacrasoul.com/",
    color: "#ff9068",
  },
  {
    title: "iRestore",
    category: "Brand Web",
    blurb:
      "At-home hair growth device commerce with strong education, proof and product hierarchy.",
    metric: "Health commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/irestore-website-1785014925113.jpg",
    url: "https://www.irestorelaser.com/",
    color: "#ffb7db",
  },
  {
    title: "Aloesun",
    category: "Commerce",
    blurb:
      "Sun-care commerce with bright product positioning and clear benefit-led shopping.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/aloesun-website-1785014995383.jpg",
    url: "https://aloesun.com/",
    color: "#b7ef66",
  },
  {
    title: "Plantmade",
    category: "Brand Web",
    blurb:
      "Superfood nutrition commerce with a fresh product story and simple shopping flow.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/plantmade-website-1785015002403.jpg",
    url: "https://www.plantmade.co/",
    color: "#8bdcff",
  },
  {
    title: "Primal",
    category: "Brand Web",
    blurb:
      "Natural supplement commerce built around trust, education and broad product discovery.",
    metric: "Supplement commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/primal-website-1785015008417.jpg",
    url: "https://primalharvest.com/",
    color: "#ffdd55",
  },
  {
    title: "Skin Choice",
    category: "Commerce",
    blurb:
      "Skincare commerce with direct acne-care positioning and a simple product-led offer.",
    metric: "Skincare commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/skin-choice-website-1785015014014.jpg",
    url: "https://www.skinchoice.com/",
    color: "#c8b5ff",
  },
  {
    title: "Dermovia",
    category: "Commerce",
    blurb:
      "Skincare product commerce focused on education, routines and problem-solution clarity.",
    metric: "Skincare commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/dermovia-website-1785015019502.jpg",
    url: "https://www.dermovia.com/",
    color: "#64e6c0",
  },
  {
    title: "Full Hair Club",
    category: "Commerce",
    blurb:
      "Hair-care commerce with bold brand voice and a streamlined treatment-focused shopping path.",
    metric: "Hair commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/full-hair-club-website-1785015024431.jpg",
    url: "https://fullhairclub.com/",
    color: "#ff9068",
  },
  {
    title: "Vayose",
    category: "Brand Web",
    blurb:
      "A modern ecommerce storefront with clean positioning and lifestyle-focused product presentation.",
    metric: "Lifestyle commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/vayose-website-1785015033556.jpg",
    url: "https://vayose.com/",
    color: "#b7ef66",
  },
  {
    title: "Stretched Fusion",
    category: "Brand Web",
    blurb:
      "Fitness commerce built around at-home strength training, guidance and strong landing-page clarity.",
    metric: "Fitness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/stretched-fusion-website-1785015038321.jpg",
    url: "https://stretchedfusion.com/",
    color: "#8bdcff",
  },
  {
    title: "Holy Gels",
    category: "Commerce",
    blurb:
      "Beauty commerce with a focused gel product story and clean purchase path.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/holy-gels-website-1785015043275.jpg",
    url: "https://holygels.com/",
    color: "#ffdd55",
  },
  {
    title: "Nurecover",
    category: "Brand Web",
    blurb:
      "Recovery and wellness commerce built around a strong product promise and fast education.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/nurecover-website-1785015051488.jpg",
    url: "https://nurecover.com/",
    color: "#64e6c0",
  },
  {
    title: "Nomadica",
    category: "Commerce",
    blurb:
      "Wine commerce with editorial brand energy and strong product-led browsing.",
    metric: "Drink commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/nomadica-replacement-1785015488180.png",
    url: "https://www.explorenomadica.com/",
    color: "#ffb7db",
  },
  {
    title: "The Fresh Cookie Lab",
    category: "Commerce",
    blurb:
      "Bakery commerce with a warm, playful product story and crave-first shopping flow.",
    metric: "Food commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/the-fresh-cookie-lab-website-1785015070160.jpg",
    url: "https://thefreshcookielab.com/",
    color: "#b7ef66",
  },
  {
    title: "Flo Pilates",
    category: "Brand Web",
    blurb:
      "A local studio website built around movement, class discovery and booking intent.",
    metric: "Studio website",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/flo-pilates-website-1785015073326.jpg",
    url: "https://www.flopilates.com/",
    color: "#8bdcff",
  },
  {
    title: "AVA Mayfair",
    category: "Commerce",
    blurb:
      "Home-fragrance commerce with trust-led storytelling and premium product positioning.",
    metric: "Fragrance commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/ava-mayfair-website-1785015078306.jpg",
    url: "https://avamayfair.com/",
    color: "#ffdd55",
  },
  {
    title: "Sadboy Saga",
    category: "Brand Web",
    blurb:
      "Streetwear commerce with a distinct brand voice and direct collection-led shopping.",
    metric: "Fashion commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/sadboy-saga-website-1785015085950.jpg",
    url: "https://sadboysaga.com/",
    color: "#c8b5ff",
  },
  {
    title: "Javvy Coffee",
    category: "Commerce",
    blurb:
      "Coffee commerce with a crisp product promise, strong offer framing and subscription-ready shopping.",
    metric: "Drink commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/javvy-coffee-website-1785015208504.jpg",
    url: "https://javvycoffee.com/",
    color: "#64e6c0",
  },
  {
    title: "Fat Cow Skincare",
    category: "Commerce",
    blurb:
      "Playful skincare commerce with a memorable brand voice and product-first conversion path.",
    metric: "Skincare commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/fat-cow-skincare-website-1785015215535.jpg",
    url: "https://fatcowskin.com/",
    color: "#ff9068",
  },
  {
    title: "Fem8",
    category: "Brand Web",
    blurb:
      "Women’s wellness commerce with clean trust-building and direct product education.",
    metric: "Wellness commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/fem8-website-1785015225056.jpg",
    url: "https://fem-8.com/",
    color: "#ffb7db",
  },
  {
    title: "Zoomie",
    category: "Commerce",
    blurb:
      "Pet-focused commerce with friendly positioning and a simple product discovery path.",
    metric: "Pet commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/zoomie-website-1785015230577.jpg",
    url: "https://tryzoomie.com/",
    color: "#b7ef66",
  },
  {
    title: "JOGA",
    category: "Brand Web",
    blurb:
      "A lifestyle commerce experience with clean brand presence and focused shopping structure.",
    metric: "Lifestyle commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/joga-website-1785015235603.jpg",
    url: "https://shopjoga.com/en-us",
    color: "#8bdcff",
  },
  {
    title: "Dead Simple",
    category: "Brand Web",
    blurb:
      "A direct, minimal ecommerce experience with sharp product presentation and simple messaging.",
    metric: "Lifestyle commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/dead-simple-website-1785015241615.jpg",
    url: "https://dead-simple.co.uk/",
    color: "#ffdd55",
  },
  {
    title: "Rugged Beard",
    category: "Commerce",
    blurb:
      "Grooming commerce with a strong masculine brand language and product-led shopping.",
    metric: "Grooming commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/rugged-beard-website-1785015250136.jpg",
    url: "https://ruggedevo.com/",
    color: "#c8b5ff",
  },
  {
    title: "OMA & ME",
    category: "Commerce",
    blurb:
      "Beauty commerce with a polished brand world and focused product storytelling.",
    metric: "Beauty commerce",
    image:
      "https://res.cloudinary.com/dvtdzotx2/image/upload/f_auto,q_auto,w_1400,c_fill,ar_16:9/open-limits/oma-and-me-website-1785015256947.jpg",
    url: "https://oma-and-me.com/",
    color: "#64e6c0",
  },
];
