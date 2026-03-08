import { SkillResource } from '../models/types';

export const SKILL_RESOURCES: Record<string, { resources: SkillResource[]; project: string }> = {
  python: {
    resources: [
      { title: 'Python for Everybody (Coursera — Free)', url: 'https://www.coursera.org/specializations/python', type: 'free' },
      { title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', type: 'free' },
    ],
    project: 'Build a CLI tool that scrapes job postings and extracts required skills',
  },
  javascript: {
    resources: [
      { title: 'The Odin Project — JavaScript', url: 'https://www.theodinproject.com/paths/full-stack-javascript', type: 'free' },
      { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'free' },
    ],
    project: 'Build an interactive to-do app with localStorage persistence',
  },
  typescript: {
    resources: [
      { title: 'TypeScript Handbook (Official)', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'free' },
      { title: 'Total TypeScript — Beginner Tutorial', url: 'https://www.totaltypescript.com/tutorials', type: 'free' },
    ],
    project: 'Convert an existing JavaScript project to TypeScript with strict mode',
  },
  react: {
    resources: [
      { title: 'React.dev — Official Tutorial', url: 'https://react.dev/learn', type: 'free' },
      { title: 'Full Stack Open — React', url: 'https://fullstackopen.com/en/', type: 'free' },
    ],
    project: 'Build a weather dashboard that fetches data from a public API',
  },
  angular: {
    resources: [
      { title: 'Angular.dev — Official Tutorial', url: 'https://angular.dev/tutorials', type: 'free' },
      { title: 'Angular University', url: 'https://angular-university.io/', type: 'paid' },
    ],
    project: 'Build a task management app with Angular routing and forms',
  },
  nodejs: {
    resources: [
      { title: 'The Odin Project — NodeJS', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs', type: 'free' },
      { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/learn', type: 'free' },
    ],
    project: 'Build a REST API for a blog with CRUD operations and validation',
  },
  sql: {
    resources: [
      { title: 'SQLBolt — Interactive SQL Lessons', url: 'https://sqlbolt.com/', type: 'free' },
      { title: 'Mode Analytics — SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'free' },
    ],
    project: 'Design a database for an e-commerce store and write 10 analytical queries',
  },
  docker: {
    resources: [
      { title: 'Docker Getting Started Guide', url: 'https://docs.docker.com/get-started/', type: 'free' },
      { title: 'Docker Mastery (Udemy)', url: 'https://www.udemy.com/course/docker-mastery/', type: 'paid' },
    ],
    project: 'Containerize a full-stack app (frontend + backend + database) with Docker Compose',
  },
  kubernetes: {
    resources: [
      { title: 'Kubernetes the Hard Way', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', type: 'free' },
      { title: 'KodeKloud — CKA Course', url: 'https://kodekloud.com/courses/certified-kubernetes-administrator-cka/', type: 'paid' },
    ],
    project: 'Deploy a microservices app to a local Kubernetes cluster with Minikube',
  },
  aws: {
    resources: [
      { title: 'AWS Skill Builder (Free Tier)', url: 'https://skillbuilder.aws/', type: 'free' },
      { title: 'Stephane Maarek — AWS SAA (Udemy)', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/', type: 'paid' },
    ],
    project: 'Deploy a serverless API using Lambda + API Gateway + DynamoDB',
  },
  terraform: {
    resources: [
      { title: 'HashiCorp Learn — Terraform', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'free' },
      { title: 'Terraform Up & Running (Book)', url: 'https://www.terraformupandrunning.com/', type: 'paid' },
    ],
    project: 'Write Terraform configs to provision a VPC, EC2, and RDS on AWS',
  },
  git: {
    resources: [
      { title: 'Learn Git Branching (Interactive)', url: 'https://learngitbranching.js.org/', type: 'free' },
      { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', type: 'free' },
    ],
    project: 'Contribute to an open-source project by forking, branching, and submitting a PR',
  },
  'rest-api': {
    resources: [
      { title: 'RESTful API Design — Best Practices', url: 'https://restfulapi.net/', type: 'free' },
      { title: 'Postman Learning Center', url: 'https://learning.postman.com/', type: 'free' },
    ],
    project: 'Design and document a REST API for a library management system using OpenAPI/Swagger',
  },
  html: {
    resources: [
      { title: 'MDN — HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics', type: 'free' },
      { title: 'freeCodeCamp — Responsive Web Design', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', type: 'free' },
    ],
    project: 'Build a semantic, accessible portfolio website using only HTML',
  },
  css: {
    resources: [
      { title: 'CSS Tricks — Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'free' },
      { title: 'Kevin Powell — CSS YouTube', url: 'https://www.youtube.com/@KevinPowell', type: 'free' },
    ],
    project: 'Recreate a popular website landing page (e.g., Stripe) using only CSS',
  },
  pandas: {
    resources: [
      { title: 'Kaggle — Pandas Course', url: 'https://www.kaggle.com/learn/pandas', type: 'free' },
      { title: 'Pandas Official Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'free' },
    ],
    project: 'Analyze a Kaggle dataset (e.g., Titanic) and generate 5 key insights with visualizations',
  },
  'scikit-learn': {
    resources: [
      { title: 'Scikit-learn Official Tutorials', url: 'https://scikit-learn.org/stable/tutorial/index.html', type: 'free' },
      { title: 'Kaggle — Intro to Machine Learning', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'free' },
    ],
    project: 'Build a house price prediction model and evaluate it with cross-validation',
  },
  statistics: {
    resources: [
      { title: 'Khan Academy — Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'free' },
      { title: 'StatQuest YouTube Channel', url: 'https://www.youtube.com/@statquest', type: 'free' },
    ],
    project: 'Conduct an A/B test analysis on a sample dataset with hypothesis testing',
  },
  'data-viz': {
    resources: [
      { title: 'Kaggle — Data Visualization', url: 'https://www.kaggle.com/learn/data-visualization', type: 'free' },
      { title: 'Storytelling with Data (Book)', url: 'https://www.storytellingwithdata.com/', type: 'paid' },
    ],
    project: 'Create an interactive dashboard with 5 charts using matplotlib/seaborn or Plotly',
  },
  'ci-cd': {
    resources: [
      { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'free' },
      { title: 'GitLab CI/CD Tutorial', url: 'https://docs.gitlab.com/ee/ci/', type: 'free' },
    ],
    project: 'Set up a CI/CD pipeline that runs tests, builds, and deploys a web app on every push',
  },
  linux: {
    resources: [
      { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'free' },
      { title: 'OverTheWire — Bandit (Linux Wargame)', url: 'https://overthewire.org/wargames/bandit/', type: 'free' },
    ],
    project: 'Set up a Linux server from scratch, configure SSH, firewall, and deploy a web app',
  },
  postgresql: {
    resources: [
      { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'free' },
      { title: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/current/tutorial.html', type: 'free' },
    ],
    project: 'Design a multi-table schema with indexes and write 10 complex queries with JOINs',
  },
  mongodb: {
    resources: [
      { title: 'MongoDB University (Free)', url: 'https://university.mongodb.com/', type: 'free' },
      { title: 'MongoDB Official Docs', url: 'https://www.mongodb.com/docs/', type: 'free' },
    ],
    project: 'Build a REST API backed by MongoDB with aggregation pipeline queries',
  },
  'unit-testing': {
    resources: [
      { title: 'Testing JavaScript (Kent C. Dodds)', url: 'https://testingjavascript.com/', type: 'paid' },
      { title: 'Jest Official Docs', url: 'https://jestjs.io/docs/getting-started', type: 'free' },
    ],
    project: 'Add 80%+ test coverage to an existing project with unit and integration tests',
  },
  'deep-learning': {
    resources: [
      { title: 'Fast.ai — Practical Deep Learning', url: 'https://course.fast.ai/', type: 'free' },
      { title: 'DeepLearning.AI Specialization (Coursera)', url: 'https://www.coursera.org/specializations/deep-learning', type: 'paid' },
    ],
    project: 'Build an image classifier using a CNN and deploy it as a web app',
  },
  tensorflow: {
    resources: [
      { title: 'TensorFlow Official Tutorials', url: 'https://www.tensorflow.org/tutorials', type: 'free' },
      { title: 'DeepLearning.AI TensorFlow Developer (Coursera)', url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice', type: 'paid' },
    ],
    project: 'Build a sentiment analysis model and serve it with TensorFlow Serving',
  },
  pytorch: {
    resources: [
      { title: 'PyTorch Official Tutorials', url: 'https://pytorch.org/tutorials/', type: 'free' },
      { title: 'Deep Learning with PyTorch (Book — Free)', url: 'https://pytorch.org/deep-learning-with-pytorch', type: 'free' },
    ],
    project: 'Implement a GAN that generates handwritten digits (MNIST)',
  },
  agile: {
    resources: [
      { title: 'Atlassian Agile Coach', url: 'https://www.atlassian.com/agile', type: 'free' },
      { title: 'Scrum Guide (Official)', url: 'https://scrumguides.org/', type: 'free' },
    ],
    project: 'Run a 2-week sprint on a personal project using Jira or Trello with proper ceremonies',
  },
};

