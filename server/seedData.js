// server/seedData.js
// Default seed data extracted directly from existing portfolio data
// Ensures 100% preservation of all existing content

export const initialProfile = {
  name: "Raditya Atma Aziz",
  brandName: "Vezta Studio",
  monogram: "Vezta Studio",
  eyebrow: "AVAILABLE FOR SELECT PROJECTS",
  role: "Graphic Design & Web Designer",
  location: "Semarang, Indonesia",
  headlinePrefix: "Hi, I'm",
  description: "Aku bantu brand dan bisnis kreatif bikin identitas visual yang ikonik serta pengalaman digital yang asyik dan nyambung sama audiens.",
  bio: "I'm a multidisciplinary designer focused on building brands and digital experiences that feel clear, human, and memorable. I work with ambitious startups, founders, and creative teams to turn ideas into thoughtful visual experiences.",
  avatarUrl: "/assets/images/user-portrait.png",
  aboutImageUrl: "/assets/images/about-user.jpg",
  availabilityBadge: "Available for work",
  availabilityStatusText: "I'm currently accepting new projects for",
  availabilityPeriod: "October 2026.",
  resumeUrl: "/assets/CV ATS Raditya Atma Aziz_Graphic Design.pdf",
  resumeLabel: "Download Resume",
};

export const initialProjects = [
  {
    id: "Travel",
    title: "Travel Poster",
    category: "Desain Grafis",
    type: "Visual Identity",
    year: "2026",
    image: "/assets/images/Travel World.jpg",
    images: ["/assets/images/Travel World.jpg"],
    description: "Konsep identitas visual dan desain poster perjalanan (travel poster) yang inspiratif untuk membangkitkan jiwa berpetualang menjelajahi dunia. Menampilkan perpaduan tipografi modern, palet warna bertema petualangan, serta ilustrasi destinasi ikonik global untuk menciptakan kesan eksplorasi yang mendalam.",
    role: "Desainer Grafis",
    client: "Travel World Inc.",
    link: "https://drive.google.com/file/d/1puQQPqxiDD57bNkDsvgm6Pou4ZNBwiat/view?usp=sharing",
    linkLabel: "Lihat Project Asli",
    services: [
      "Art Direction",
      "Visual Identity",
      "Poster Design",
      "Digital Design",
      "Brand Guidelines"
    ],
    highlight: "Featured on Instagram Post",
    deliverables: "Seri desain poster perjalanan tematik, panduan identitas visual (visual style guide), serta aset grafis siap cetak dan digital untuk kebutuhan promosi.",
    displayOrder: 1,
    isVisible: true
  },
  {
    id: "ai-video-content",
    title: "AI Video Content Creation",
    category: "Ai Video Content",
    type: "AI & Motion Production",
    year: "2026",
    image: "/assets/images/CV Essenli.png",
    images: ["/assets/images/CV Essenli.png"],
    description: "Produksi konten video pendek vertikal dan komersial inovatif berbasis Generative AI untuk kampanye digital modern. Mengombinasikan visual karakter 3D/animasi beresolusi tinggi, prompt engineering visual yang presisi, serta alur cerita kreatif untuk menarik perhatian audiens di media sosial.",
    role: "AI Video Creator & Editor",
    client: "CV.Essenli",
    link: "https://drive.google.com/drive/folders/1epRH4-cFppxdQJ9RUD1ZojghMQG2AnVN?usp=sharing",
    linkLabel: "Lihat Showcase Video",
    services: [
      "AI Prompt Engineering",
      "Generative Video Production",
      "Motion Design & Visual FX",
      "Social Media Content Strategy",
      "Video Editing & Post-Processing"
    ],
    highlight: "Featured on Tiktok Post",
    deliverables: "Rangkaian konsep video komersial 9:16 (TikTok & Reels), skenario skrip promosi produk, aset prompt animasi kustom, serta video final siap tayang.",
    displayOrder: 2,
    isVisible: true
  },
  {
    id: "nanas-madu-web",
    title: "Nanas Madu Pemalang",
    category: "UI/UX",
    type: "Website",
    year: "2026",
    image: "/assets/images/nanas madu.png",
    images: ["/assets/images/nanas madu.png"],
    description: "Website landing page interaktif dan modern yang dirancang khusus untuk mempromosikan Nanas Madu Pemalang berkualitas tinggi. Mengusung visual bernuansa tropis yang segar, tata letak responsif, serta informasi produk yang lengkap guna mempermudah pelanggan dalam mengenal dan memesan produk langsung secara online.",
    role: "UI/UX Designer",
    client: "Nanas Madu Pemalang",
    link: "https://nanas-madu-landing-page.vercel.app/",
    linkLabel: "Lihat Project Asli",
    services: [
      "Product Strategy",
      "User Experience",
      "Mobile UI Design",
      "User Interface",
      "Responsive Design"
    ],
    highlight: "Deployed in Vercel",
    deliverables: "Desain UI/UX landing page yang responsif untuk perangkat seluler dan desktop, aset visual bertema tropis, serta prototipe interaktif yang siap untuk tahap pengembangan.",
    displayOrder: 3,
    isVisible: true
  },
  {
    id: "carousel-post",
    title: "Carousel Post",
    category: "Desain Grafis",
    type: "Brand Identity",
    year: "2026",
    image: "/assets/images/Carousel Post 1.jpg",
    images: [
      "/assets/images/Carousel Post 1.jpg",
      "/assets/images/Carousel Post 2.jpg",
      "/assets/images/Carousel Post 3.jpg",
      "/assets/images/Carousel Post 4.jpg"
    ],
    description: "Desain konten carousel post media sosial yang menarik dan informatif untuk memperkenalkan pengalaman berkunjung ke Hetero Space Semarang. Mengusung visual modern, tata letak yang interaktif antarslide, serta konsep estetika yang selaras untuk meningkatkan engagement audiens.",
    role: "Intern Graphic Designer",
    client: "Hetero Space Semarang",
    link: "https://drive.google.com/drive/folders/1D1YCGMsxHs1qEF1-3FJxbTdCw9f41VA6?usp=sharing",
    linkLabel: "Showcase Carousel",
    services: [
      "Social Media Design",
      "Visual Identity",
      "Carousel Layout & Content Strategy",
      "Digital Design"
    ],
    highlight: "Selected for Instagram Post",
    deliverables: "Rangkaian desain carousel post multi-slide beresolusi tinggi, aset grafis pendukung, serta draf copywriting visual untuk kebutuhan publikasi media sosial.",
    displayOrder: 4,
    isVisible: true
  },
  {
    id: "promotion-post",
    title: "Promotion Poster",
    category: "Desain Grafis",
    type: "Digital Marketing",
    year: "2026",
    image: "/assets/images/Promotion Post 1.jpg",
    images: [
      "/assets/images/Promotion Post 1.jpg",
      "/assets/images/Promotion Post 2.jpg"
    ],
    description: "Desain poster promosi digital yang atraktif dan komunikatif untuk kampanye pemasaran co-working space Hetero Space Semarang. Menampilkan informasi penawaran harga yang menonjol, tata letak visual yang bersih, serta suasana ruang kerja kolaboratif yang menarik perhatian calon pengunjung.",
    role: "Intern Graphic Designer",
    client: "Hetero Space Semarang",
    link: "https://drive.google.com/drive/folders/1D1YCGMsxHs1qEF1-3FJxbTdCw9f41VA6?usp=sharing",
    linkLabel: "Showcase Promotion",
    services: [
      "Social Media Design",
      "Digital Marketing Assets",
      "Poster Design",
      "Typography Design",
      "Promotional Graphic Design"
    ],
    highlight: "Selected for Instagram Post",
    deliverables: "Desain poster promosi digital beresolusi tinggi (siap tayang untuk feed Instagram/media sosial), variasi ukuran format iklan, serta aset visual pendukung kampanye pemasaran.",
    displayOrder: 5,
    isVisible: true
  }
];

export const initialExperience = [
  {
    period: "July 2026 — Present",
    role: "Video Ai Content Creator",
    company: "CV.Essenli",
    location: "Semarang, Indonesia & Remote",
    description: "Creating short-form videos for content creators and brands using AI tools such as ChatGPT, Gemini and many more. Maintaining consistency in the company’s visual identity across various platforms.",
    highlights: ["87+ successful content videos", "Creating copywriting and visual content", "Optimizing the content production process"],
    displayOrder: 1,
    isVisible: true
  },
  {
    period: "June 2026 — August 2026",
    role: "Intern Graphic Design",
    company: "Impala Network & Hetero Space",
    location: "Semarang, Indonesia & Hybrid",
    description: "Designing social media content for branding and promotional purposes. Creating posters, banners, Instagram posts, and other digital visual content. Collaborate with the marketing team on the development of visual campaigns. Maintaining consistency in the company’s visual identity across various platforms.",
    highlights: ["Design post and videos for social media content", "Create visual guidelines", "Work on the development of digital products"],
    displayOrder: 2,
    isVisible: true
  },
  {
    period: "June 2026 — September 2026",
    role: "Graphic Design Manager Internship",
    company: "PT.Kunci Legal",
    location: "Remote, Indonesia",
    description: "Responsible for managing and overseeing all graphic design-related activities within the company. Creating design strategies to support marketing and branding goals.",
    highlights: ["Manage and oversee all graphic design-related activities", "Create design strategies", "Support marketing and branding goals"],
    displayOrder: 3,
    isVisible: true
  },
  {
    period: "June 2026 — August 2026",
    role: "Marketing Specialist",
    company: "BSP Point",
    location: "Work From Anywhere, Indonesia",
    description: "Developed and executed marketing content to support brand awareness and audience engagement. Managed social media content, created promotional materials, and contributed to digital marketing campaigns. Collaborated with the team to develop creative ideas and ensure consistent brand communication across digital platforms.",
    highlights: ["Developed and executed marketing content to support brand awareness and audience engagement.", "Managed social media content, created promotional materials, and contributed to digital marketing campaigns.", "Collaborated with the team to develop creative ideas and ensure consistent brand communication across digital platforms."],
    displayOrder: 4,
    isVisible: true
  }
];

export const initialTools = [
  // Desain
  { name: "Canva", role: "Social Media & Graphic Design", category: "Desain", iconKey: "canva", displayOrder: 1, isVisible: true },
  { name: "Figma", role: "UI/UX Design & Prototyping", category: "Desain", iconKey: "figma", displayOrder: 2, isVisible: true },
  { name: "Adobe Photoshop", role: "Photo Manipulation & Poster", category: "Desain", iconKey: "photoshop", displayOrder: 3, isVisible: true },
  { name: "Affinity", role: "Vector Art & Editorial Layout", category: "Desain", iconKey: "affinity", displayOrder: 4, isVisible: true },
  // Prompting AI
  { name: "ChatGPT", role: "Prompting, Script & Creative Ideas", category: "Prompting AI", iconKey: "chatgpt", displayOrder: 5, isVisible: true },
  { name: "Gemini", role: "Generative AI & Multimodal Brainstorm", category: "Prompting AI", iconKey: "gemini", displayOrder: 6, isVisible: true },
  { name: "Google Flow", role: "Cinematic AI & Workflow Studio", category: "Prompting AI", iconKey: "flow", displayOrder: 7, isVisible: true },
  { name: "Claude AI", role: "Deep Reasoning, Long-form & Analysis", category: "Prompting AI", iconKey: "claude", displayOrder: 8, isVisible: true },
  // Front End Development
  { name: "HTML", role: "Semantic Structure & Accessible Web", category: "Front End Development", iconKey: "html", displayOrder: 9, isVisible: true },
  { name: "CSS", role: "Modern Layouts & Smooth Animations", category: "Front End Development", iconKey: "css", displayOrder: 10, isVisible: true },
  { name: "JavaScript", role: "Interactive Web Logic & ES6+", category: "Front End Development", iconKey: "js", displayOrder: 11, isVisible: true },
  { name: "React.js", role: "Modern Component-Driven Web Apps", category: "Front End Development", iconKey: "react", displayOrder: 12, isVisible: true },
  { name: "Tailwind CSS", role: "High-Performance Utility Styling", category: "Front End Development", iconKey: "tailwind", displayOrder: 13, isVisible: true },
  // Office & Productivity
  { name: "Google Meet", role: "Virtual Meeting & Client Alignment", category: "Office", iconKey: "meet", displayOrder: 14, isVisible: true },
  { name: "Google Docs", role: "Creative Briefs & Copywriting", category: "Office", iconKey: "docs", displayOrder: 15, isVisible: true },
  { name: "Google Spreadsheet", role: "Budget, Timelines & Data Tracking", category: "Office", iconKey: "sheets", displayOrder: 16, isVisible: true },
  { name: "Zoom", role: "Remote Collaboration & Screen Share", category: "Office", iconKey: "zoom", displayOrder: 17, isVisible: true },
  { name: "Notion", role: "Workspace Organization & Task Board", category: "Office", iconKey: "notion", displayOrder: 18, isVisible: true },
  // Video & Cloud
  { name: "CapCut", role: "Short-form & Vertical Video Editing", category: "Desain", iconKey: "capcut", displayOrder: 19, isVisible: true },
  { name: "Google Drive", role: "Asset Storage & Client Deliverables", category: "Office", iconKey: "drive", displayOrder: 20, isVisible: true }
];

export const initialSkills = [
  {
    number: "01",
    title: "Graphic Design",
    description: "Creating visually stunning graphics for a variety of purposes, including social media, marketing, and web design.",
    deliverables: [
      "Social Media Post & Video",
      "Marketing Materials",
      "Logo & Modular Mark Systems",
      "Typography & Color Palettes",
      "Comprehensive Brand Books"
    ],
    displayOrder: 1,
    isVisible: true
  },
  {
    number: "02",
    title: "Front End Development",
    description: "Transforming UI/UX designs into responsive, high-performance websites using modern web technologies. Building seamless user interfaces with a focus on performance, accessibility, and cross-browser compatibility.",
    deliverables: [
      "Responsive Web Development",
      "Performance Optimization",
      "Cross-Browser Compatibility",
      "Web Animations & Micro-interactions",
      "Content & Layout Styling"
    ],
    displayOrder: 2,
    isVisible: true
  },
  {
    number: "03",
    title: "UI/UX Design",
    description: "Creating seamless and intuitive user experiences across digital platforms, focusing on user-centered design principles and modern design trends.",
    deliverables: [
      "User Interface (UI) Design",
      "User Experience (UX) Design",
      "Wireframing & Prototyping",
      "Interaction Design"
    ],
    displayOrder: 3,
    isVisible: true
  },
  {
    number: "04",
    title: "Video Editing",
    description: "Transforming raw footage into engaging visual narratives with dynamic editing, pacing, and motion design to captivate audiences across platforms.",
    deliverables: [
      "Video Editing & Post-Production",
      "Motion Graphics & Animation",
      "Sound Design & Audio Mixing",
      "Color Correction & Grading",
      "Content & Layout Styling"
    ],
    displayOrder: 4,
    isVisible: true
  }
];

export const initialSocials = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/raditya-atma-aziz-063925321", username: "Raditya Atma Aziz", displayOrder: 1, isVisible: true },
  { name: "Google Drive", url: "https://drive.google.com/drive/folders/1Y8pS2HDwyMdsg_Iv7kq52rya-NkMasFb?usp=sharing", username: "Google Drive", displayOrder: 2, isVisible: true },
  { name: "GitHub", url: "https://github.com/atmaaziz06-alt", username: "GitHub", displayOrder: 3, isVisible: true },
  { name: "Instagram", url: "https://www.instagram.com/atma.zyies/", username: "@atma_zyies", displayOrder: 4, isVisible: true }
];

export const initialContact = {
  ctaTitle: "Have a project in mind? Let's create something iconic.",
  ctaDescription: "Currently accepting selected freelance and contract design projects. Available for creative direction, visual brand identity, and modern digital web experiences.",
  email: "atmaaziz06@gmail.com",
  phone: "+62-877-6279-8586",
  whatsapp: "6287762798586",
  primaryBtnText: "Start a conversation",
  primaryBtnLink: "#contact",
  secondaryBtnText: "Email me directly",
  secondaryBtnLink: "mailto:atmaaziz06@gmail.com"
};

export const initialSettings = {
  siteTitle: "Raditya Atma Aziz — Graphic Design & Web Designer",
  brandName: "Vezta Studio",
  siteDescription: "Portfolio & Creative Studio of Raditya Atma Aziz, specializing in Graphic Design, AI Video Content, and Modern Web Experiences.",
  footerBrand: "Vezta Studio",
  footerCopyright: "Vezta Studio. All rights reserved.",
  footerNote: "Designed & built with intention.",
  seoTitle: "Raditya Atma Aziz — Graphic Design & Web Designer Portfolio",
  seoDescription: "Aku bantu brand dan bisnis kreatif bikin identitas visual yang ikonik serta pengalaman digital yang asyik dan nyambung sama audiens.",
  seoKeywords: "graphic design, portfolio, UI/UX, AI video, web designer, semarang, indonesia",
  ogImage: "/assets/images/user-portrait.png"
};

export const initialCertifications = [
  {
    title: "Professional Certificate in UI/UX & Visual Communication",
    issuer: "Academy of Digital Arts",
    issueDate: "November 2025",
    expiryDate: "Tidak Kedaluwarsa",
    credentialId: "ADA-UXD-2025-98214",
    credentialUrl: "https://coursera.org",
    imageUrl: "/assets/images/certificate-ux-design.jpg",
    category: "UI/UX Design",
    description: "Sertifikasi kompetensi profesional komprehensif yang menguji keahlian riset pengguna (UX research), arsitektur informasi, wireframing, perancangan antarmuka visual (UI design), prototipe interaktif, dan standar design system.",
    displayOrder: 1,
    isVisible: true
  },
  {
    title: "Certified Graphic Designer & Visual Identity Specialist",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    issueDate: "Agustus 2025",
    expiryDate: "Agustus 2028",
    credentialId: "BNSP-DSN-84729-ID",
    credentialUrl: "https://bnsp.go.id",
    imageUrl: "/assets/images/certificate-ux-design.jpg",
    category: "Desain Grafis",
    description: "Pengakuan standar kompetensi kerja nasional mencakup prinsip dasar komunikasi visual, tipografi editorial, teori warna, perancangan identitas visual brand terpadu, dan final art artwork siap produksi.",
    displayOrder: 2,
    isVisible: true
  },
  {
    title: "Front-End Web Development Specialization",
    issuer: "Dicoding Indonesia",
    issueDate: "Januari 2026",
    expiryDate: "Tidak Kedaluwarsa",
    credentialId: "DICODING-FE-77218-XX",
    credentialUrl: "https://dicoding.com",
    imageUrl: "/assets/images/certificate-ux-design.jpg",
    category: "Web Development",
    description: "Standar kurikulum industri untuk penguasaan fundamental web modern: Semantic HTML5, CSS Grid & Flexbox, JavaScript ES6+, integrasi API, serta optimasi performa dan aksesibilitas website.",
    displayOrder: 3,
    isVisible: true
  }
];

export const initialEvents = [
  {
    title: "Workshop Brand Identity & Typography Eksploratif",
    organizer: "Komunitas Desain Grafis Indonesia",
    date: "14 Januari 2026",
    period: "2026",
    location: "Semarang, Jawa Tengah",
    role: "Peserta Aktif",
    description: "Pelatihan intensif pengembangan identitas visual brand, eksplorasi gaya tipografi kontemporer, dan strategi pengemasan portofolio visual untuk klien global.",
    imageUrl: "/assets/images/event-workshop.jpg",
    linkUrl: "https://instagram.com/atma.zyies/",
    displayOrder: 1,
    isVisible: true
  },
  {
    title: "Creative Innovation & Visual Design Summit",
    organizer: "Creative Tech Summit 2025",
    date: "28 November 2025",
    period: "2025",
    location: "Semarang / Hybrid",
    role: "Peserta & Kolaborator",
    description: "Forum seminar dan eksibisi teknologi kreatif nasional yang membahas tren Generative AI dalam produksi konten visual, motion graphics komersial, dan arah industri desain digital masa depan.",
    imageUrl: "/assets/images/event-seminar.jpg",
    linkUrl: "https://instagram.com/atma.zyies/",
    displayOrder: 2,
    isVisible: true
  }
];

