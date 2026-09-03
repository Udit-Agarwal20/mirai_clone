const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');
const FeeCalculatorService = require('./feeCalculatorService');

class CareerPlannerService {
  /**
   * Deterministic rule-based career roadmap generator
   */
  static async generatePlan({
    academicScore = 85,
    primaryInterest = 'ai_ml', // 'ai_ml', 'web_cloud', 'robotics_hardware', 'fintech_startup', 'game_graphics'
    careerGoal = 'ai_engineer', // 'ai_engineer', 'fullstack_architect', 'robotics_lead', 'startup_founder', 'researcher'
    codingExperience = 'beginner', // 'none', 'beginner', 'intermediate', 'advanced'
    budgetRange = 'moderate', // 'flexible', 'budget_conscious', 'scholarship_dependent'
    preferredCampusCity = 'Bengaluru',
    hostelNeeded = true,
  }) {
    const programs = await Program.find({ isActive: true }).populate('campuses');
    const campuses = await Campus.find();
    const scholarships = await Scholarship.find({ isActive: true });

    const pcm = Number(academicScore) || 75;

    // 1. Program & Track Matching Matrix
    let matchedProgramSlug = 'btech-cse-ai';
    let trackName = 'AI Systems & LLM Engineering';
    let careerOutcomeTitle = 'Senior AI/ML Systems Engineer';
    let expectedStartingRange = '₹18 LPA – ₹38 LPA';

    if (primaryInterest === 'robotics_hardware' || careerGoal === 'robotics_lead') {
      matchedProgramSlug = 'btech-autonomous-systems-robotics';
      trackName = 'Autonomous Robotics & Edge AI';
      careerOutcomeTitle = 'Robotics Perception & Firmware Engineer';
      expectedStartingRange = '₹16 LPA – ₹32 LPA';
    } else if (primaryInterest === 'fintech_startup' || careerGoal === 'startup_founder') {
      matchedProgramSlug = 'btech-product-engineering-fintech';
      trackName = 'Venture Engineering & Distributed Systems';
      careerOutcomeTitle = 'Product Systems Architect / Founder';
      expectedStartingRange = '₹20 LPA – ₹42 LPA (or Funded Startup)';
    } else if (primaryInterest === 'ai_ml' || careerGoal === 'ai_engineer') {
      matchedProgramSlug = 'btech-ai-data-engineering';
      trackName = 'Generative AI & Data Platforms';
      careerOutcomeTitle = 'Applied AI Engineer & Data Architect';
      expectedStartingRange = '₹18 LPA – ₹36 LPA';
    } else {
      matchedProgramSlug = 'btech-cse-ai';
      trackName = 'Full-Stack Product & Distributed Systems';
      careerOutcomeTitle = 'Core Software & Infrastructure Architect';
      expectedStartingRange = '₹16 LPA – ₹34 LPA';
    }

    // Find actual program in DB, or fallback to first
    let selectedProgram = programs.find((p) => p.slug === matchedProgramSlug) || programs[0];

    // 2. Select Campus
    let selectedCampus =
      campuses.find((c) => c.city.toLowerCase() === preferredCampusCity.toLowerCase()) || campuses[0];

    // 3. Evaluate potential scholarship
    let matchingScholarship = null;
    if (pcm >= 90) {
      matchingScholarship = scholarships.find((s) => s.percentage >= 50) || scholarships[0];
    } else if (pcm >= 80) {
      matchingScholarship = scholarships.find((s) => s.percentage >= 25) || scholarships[0];
    } else if (budgetRange === 'scholarship_dependent') {
      matchingScholarship = scholarships.find((s) => s.category === 'Need-Based') || scholarships[0];
    }

    // 4. Calculate customized fee breakdown
    let feeEstimate = null;
    if (selectedProgram && selectedCampus) {
      feeEstimate = FeeCalculatorService.calculate({
        program: selectedProgram,
        campus: selectedCampus,
        includeHostel: Boolean(hostelNeeded),
        scholarship: matchingScholarship,
        financingTenureMonths: 48,
      });
    }

    // 5. Tailor the 4-Year Journey Milestone Blueprint based on coding experience
    const journeyMilestones = [
      {
        year: 'Year 1',
        theme: 'Foundations & Shipped MVPs',
        focus:
          codingExperience === 'advanced'
            ? 'Compiler internals, Low-level C/Rust, distributed architecture, ship 2 production web utilities.'
            : 'Python, TypeScript, Algorithmic thinking, Linux CLI, ship first full-stack web application from scratch.',
        coreStack: ['TypeScript', 'Python', 'PostgreSQL', 'Docker', 'Git CI/CD'],
        capstoneProject: 'Distributed Multi-tenant Real-time Collaboration Engine',
        semesterMilestone: 'Deploy a live SaaS with 100+ active user accounts',
      },
      {
        year: 'Year 2',
        theme: 'AI Architecture & Deep Systems',
        focus:
          'Deep Learning, Transformers from scratch, GPU kernel optimization (CUDA), vector indexing, low-latency API engines.',
        coreStack: ['PyTorch', 'CUDA', 'FastAPI', 'Qdrant / Milvus', 'Kubernetes'],
        capstoneProject: 'Autonomous Agentic Workflow Engine with Local LLM Reasoning',
        semesterMilestone: 'Publish an open-source technical library with >250 GitHub stars',
      },
      {
        year: 'Year 3',
        theme: 'Global Industry Immersion & Open Source',
        focus:
          '6-month full-time paid venture internship with high-growth AI unicorn or Silicon Valley tech labs. Contribute to Tier-1 open source codebases.',
        coreStack: ['Distributed Systems', 'MLOps (Ray, vLLM)', 'Microservices', 'Enterprise Security'],
        capstoneProject: 'High-throughput RAG Pipeline Processing 10,000 requests/second',
        semesterMilestone: 'Earn stipend between ₹60,000 - ₹1,50,000 / month during co-op semester',
      },
      {
        year: 'Year 4',
        theme: 'Venture Incubation or Tier-1 Engineering Placement',
        focus:
          'Nova Venture Lab incubator grant (₹10 Lakh seed) OR placement recruitment pipeline with top AI research labs & global firms.',
        coreStack: ['Full System Architecture', 'Cloud Scaling (GCP/AWS)', 'Founder Pitching', 'Production Observability'],
        capstoneProject: 'Commercial Product Launch or Peer-reviewed NeurIPS/ICML paper',
        semesterMilestone: 'Graduate with formal degree, equity in your product, and verified portfolio',
      },
    ];

    // 6. Actionable Next Steps
    const nextSteps = [
      {
        step: 1,
        title: 'Complete Free NOVA Technical Aptitude & Logic Assessment',
        description: 'A 60-minute practical logic and problem-solving assessment (no prior coding required).',
        actionUrl: '/admissions',
        badge: 'Immediate',
      },
      {
        step: 2,
        title: 'Schedule 1-on-1 Faculty Interview & Portfolio Review',
        description: 'Discuss your aspirations, projects, and creative ambitions with a NOVA engineering mentor.',
        actionUrl: '/mentors',
        badge: 'Within 5 Days',
      },
      {
        step: 3,
        title: 'Lock In Merit Scholarship & Secure Priority Campus Housing',
        description: 'Submit academic credentials to freeze your seat before regional intake closes.',
        actionUrl: '/fees',
        badge: 'Priority Stage',
      },
    ];

    return {
      studentProfile: {
        academicScore: pcm,
        primaryInterest,
        careerGoal,
        codingExperience,
        budgetRange,
        preferredCampusCity,
        hostelNeeded,
      },
      recommendedProgram: selectedProgram,
      recommendedTrack: trackName,
      careerOutcome: {
        role: careerOutcomeTitle,
        expectedStartingRange,
        topHirers: ['Google DeepMind', 'OpenAI', 'Anthropic', 'Uber AI', 'Stripe', 'High-growth Startups'],
      },
      campus: selectedCampus,
      estimatedCost: feeEstimate,
      scholarship: matchingScholarship,
      journeyMilestones,
      nextSteps,
      confidenceScore: '96%',
    };
  }
}

module.exports = CareerPlannerService;
