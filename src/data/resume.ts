export interface Experience {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  bullets: string[];
  badges?: string[];
}

export interface Education {
  degree: string;
  field: string;
  school: string;
  start: string;
  end: string;
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

/** Work history — newest first. Shown on /work */
export const experience: Experience[] = [
  {
    role: 'Senior Software Engineer',
    company: 'Union Street Media',
    companyUrl: 'https://www.unionstreetmedia.com',
    location: 'Burlington, VT',
    start: 'Nov 2024',
    end: 'Present',
    current: true,
    summary: 'Architected and led complex initiatives for multiple projects teams.',
    bullets: [
      'Led teams through major refactoring and performance upgrades.',
      'Developed exhaustive spam protection system.',
      'Navigated complex system upgrades.',
      'Migrated projects from AWS Serverless to CDK.',
      'Directed implementation of Single Sign-On (SSO) Service provider (SP).',
      'Performed security audits and upgrades.',
    ],
    badges: ['ReactJS', 'Redux', 'TypeScript', 'AWS', 'python', 'CDK', 'SSO', 'Security'],
  },
  {
    role: 'Software Engineer II',
    company: 'Union Street Media',
    companyUrl: 'https://www.unionstreetmedia.com',
    location: 'Burlington, VT',
    start: 'Mar 2021',
    end: 'Nov 2024',
    current: true,
    summary: 'Led frontend development with ReactJS.',
    bullets: [
      'Implemented Redux and successfully brought a 2-year project to completion.',
      'Developed systems in AWS Serverless Architecture using TypeScript Lambda and DynamoDB.',
    ],
    badges: ['ReactJS', 'Redux', 'TypeScript', 'AWS'],
  },
  {
    role: 'Software Engineer III',
    company: 'Vermont Systems, Inc',
    companyUrl: 'https://www.vermontsystems.com',
    location: 'Essex, VT',
    start: 'Oct 2018',
    end: 'Apr 2021',
    summary: 'Full Stack Development in HTML, Javascript/JQuery, Vue and Progress OpenEdge.',
    bullets: [
      'Led design and development on several cross-product integration solutions.',
      'Conducted meetings for application accessibility (WCAG).',
    ],
    badges: ['HTML', 'JavaScript', 'JQuery', 'Vue', 'Progress OpenEdge'],
  },
  {
    role: 'Software Engineer II',
    company: 'MyWebGrocer (MI9)',
    companyUrl: 'https://www.hggc.com/portfolio/my-web-grocer',
    location: 'Winooski, VT',
    start: 'Apr 2017',
    end: 'Oct 2018',
    summary: 'Development lead on Sitecore integration project.',
    bullets: [
      'Worked directly with client development teams to produce cross-platform solutions.',
      'Diagnosed and solved complex application issues.',
    ],
    badges: ['HTML', 'JavaScript', 'JQuery', 'Sitecore'],
  },
  {
    role: 'Software Engineer I',
    company: 'MyWebGrocer (MI9)',
    companyUrl: 'https://www.hggc.com/portfolio/my-web-grocer',
    location: 'Winooski, VT',
    start: 'May 2015',
    end: 'Apr 2017',
    summary: 'Full Stack Development in HTML, Javascript, KnockoutJS, C#, and ASP .NET.',
    bullets: [
      'Contributed to application development direction.',
    ],
    badges: ['HTML', 'JavaScript', 'KnockoutJS', 'C#', 'ASP.NET'],
  },
  {
    role: 'Lead Developer',
    company: 'PIEmatrix',
    companyUrl: 'https://www.pie.me/',
    location: 'Burlington, VT',
    start: 'May 2014',
    end: 'Nov 2015',
    summary: 'Oversaw code quality, architecture and team growth for a small software company.',
    bullets: [
      'Advised on product direction and hiring.',
      'Led a team of developers, QA and support.',
      'Led an extension team in India.',
      'Instituted the Scrum framework into the core development process.',
      'Facilitated Scrum meetings as the Scrum Master.',
      'Maintained a MySQL database.',
    ],
    badges: ['MySQL', 'Java', 'Adobe Flex', 'PHP', 'HTML', 'CSS', 'Bash', 'Perl', 'Maven', 'Ant', 'PowerShell', 'Linux'],
  },
  {
    role: 'Frontend Developer',
    company: 'PIEmatrix',
    companyUrl: 'https://www.pie.me/',
    location: 'Burlington, VT',
    start: 'May 2007',
    end: 'Nov 2014',
    summary: 'Oversaw front-end development and UI/UX design for a small software company.',
    bullets: [
      'Led front-end development in Adobe Flex and PHP/HTML/CSS.',
      'Led UI/UX design.',
      'Developed and maintained build scripts in Bash, Perl, Maven, Ant and PowerShell.',
      'Developed automated dev-ops scripts.',
      'Built and maintained virtual Linux server environments.',
    ],
    badges: ['Adobe Flex', 'PHP', 'HTML', 'CSS', 'Bash', 'Perl', 'Maven', 'Ant', 'PowerShell', 'Linux'],
  },
  {
    role: 'Adjunct Professor',
    company: 'Vermont Technical College',
    companyUrl: 'https://vermontstate.edu/',
    location: 'Williston, VT',
    start: 'Jan 2009',
    end: 'May 2012',
    summary: 'Taught intro and advanced website development using HTML, CSS, JavaScript, PHP, and MySQL.',
    bullets: [
      'Conducted lectures, facilitated labs and graded assignments.',
      'Developed new curriculums and grading rubrics.',
    ],
    badges: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
  },
];

/** Smaller/older roles — rendered as compact rows under the main timeline */
export const earlierRoles: { role: string; company: string; start: string; end: string }[] = [
  /*{ role: 'Engineering Intern', company: 'Some Company', start: '2020', end: '2021' },*/
];

export const education: Education[] = [
  {
    degree: 'B.Eng.',
    field: 'Computer Engineering',
    school: 'Vermont Technical College',
    start: '2004',
    end: '2008',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    skills: ['JavaScript/TypeScript', 'HTML/CSS', 'Python', 'PHP', 'C#', 'C', 'C++', 'Perl', 'Bash', 'ActionScript'],
  },
  {
    title: 'Platforms & Tools',
    skills: ['AWS', 'React/Redux', 'Laravel', 'Vue.js', 'MySQL', 'Docker', '.NET', 'AngularJS', 'JQuery', 'KnockoutJS', 'Webpack', 'Sitecore', 'Hibernate', 'Spring'],
  },
  {
    title: 'Interests',
    skills: ['Software development', 'Game development', 'puppetry', 'faith'],
  },
];

/** Words typed out one character at a time in the hero */
export const typingRoles = [
  'software engineer',
  'game developer',
  'puppeteer',
  'father',
  'christian',
];
