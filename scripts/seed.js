require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Program = require('../src/models/Program');
const Campus = require('../src/models/Campus');
const Project = require('../src/models/Project');
const Mentor = require('../src/models/Mentor');
const Scholarship = require('../src/models/Scholarship');
const Event = require('../src/models/Event');
const Announcement = require('../src/models/Announcement');
const Application = require('../src/models/Application');
const Enquiry = require('../src/models/Enquiry');
const SavedCalculation = require('../src/models/SavedCalculation');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova_institute';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at ${mongoUri}`);

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Program.deleteMany({}),
      Campus.deleteMany({}),
      Project.deleteMany({}),
      Mentor.deleteMany({}),
      Scholarship.deleteMany({}),
      Event.deleteMany({}),
      Announcement.deleteMany({}),
      Application.deleteMany({}),
      Enquiry.deleteMany({}),
      SavedCalculation.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data.');

    // 1. Seed Users (Admin & Students)
    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: process.env.ADMIN_EMAIL || 'admin@novatech.edu',
      password: process.env.ADMIN_PASSWORD || 'Admin@Nova2026!',
      role: 'admin',
      phone: '+91 98765 43210',
      profile: {
        city: 'Bengaluru',
        state: 'Karnataka',
        highSchool: 'National Institute of Tech Alumni',
      },
    });

    const student1 = await User.create({
      name: 'Alex Rivers',
      email: 'alex.rivers@example.com',
      password: 'Student@12345',
      role: 'student',
      phone: '+91 98111 22334',
      profile: {
        dob: new Date('2007-04-15'),
        gender: 'Male',
        address: '402 Cyber Heights, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        highSchool: 'Delhi Public School',
        board: 'CBSE',
        pcmPercentage: 94.5,
        entranceExam: 'JEE Main',
        entranceScore: '98.6 Percentile',
        githubUsername: 'alexrivers-code',
      },
    });

    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'Student@12345',
      role: 'student',
      phone: '+91 98222 33445',
      profile: {
        dob: new Date('2007-09-22'),
        gender: 'Female',
        address: '12 Emerald Enclave, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        highSchool: 'The Hyderabad Public School',
        board: 'ICSE',
        pcmPercentage: 96.0,
        entranceExam: 'JEE Main',
        entranceScore: '99.1 Percentile',
        githubUsername: 'priyasharma-ai',
      },
    });

    console.log(`[Seed] Seeded Users (Admin: ${adminUser.email}, Students: 2)`);

    // 2. Seed Campuses
    const campusesData = [
      {
        name: 'Bengaluru Innovation Campus',
        slug: 'bengaluru-innovation-campus',
        city: 'Bengaluru',
        state: 'Karnataka',
        tagline: 'Silicon Valley of the East • Electronic City Phase 1',
        description:
          'Located right inside the tech corridor of Electronic City, the flagship NOVA campus features 24/7 AI compute clusters, hardware prototyping labs, venture incubator suites, and direct proximity to 400+ tech companies.',
        facilities: [
          '24/7 Dedicated GPU Compute Cluster (NVIDIA H100s)',
          'Autonomous Systems & Drone Prototyping Bay',
          'Venture Incubation Hub & Seed Pitch Arena',
          'Ultra-High-Speed 10 Gbps Fiber Backbone',
          'Makerspace with Laser Cutters & 3D Print Farm',
          'Recreational Arena, Olympic Gym & Rooftop Cafe',
        ],
        labs: [
          'Distributed Systems & Concurrency Lab',
          'Perception & Edge Robotics Lab',
          'Generative AI Applied Research Lab',
          'FinTech Algorithmic Trading Sandbox',
        ],
        hostelOptions: [
          {
            name: 'Studio Suite (Single AC)',
            roomType: 'Single AC',
            annualFee: 240000,
            mealsIncluded: true,
            description: 'Private room with ensuite bathroom, high-speed ergonomic workspace, air conditioning, and daily housekeeping.',
          },
          {
            name: 'Twin Executive (Sharing AC)',
            roomType: 'Twin Sharing AC',
            annualFee: 180000,
            mealsIncluded: true,
            description: 'Spacious dual occupancy room with dedicated dual study desks, central AC, and shared private bathroom.',
          },
          {
            name: 'Triple Comfort (Non-AC)',
            roomType: 'Triple Sharing Non-AC',
            annualFee: 130000,
            mealsIncluded: true,
            description: 'Comfortable triple-sharing room with individual wardrobes, study desks, and natural cross-ventilation.',
          },
        ],
        annualHostelFeeDefault: 180000,
        securityDeposit: 25000,
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        address: 'NOVA Tech Park, 44 Hosur Road, Electronic City Phase 1, Bengaluru, KA 560100',
        contactEmail: 'bengaluru.admissions@novatech.edu',
        contactPhone: '+91 80 4920 1801',
        availableSeats: 320,
        status: 'Admissions Open',
        featured: true,
      },
      {
        name: 'Hyderabad AI Corridor',
        slug: 'hyderabad-ai-corridor',
        city: 'Hyderabad',
        state: 'Telangana',
        tagline: 'HITEC City • Center for Scaled Enterprise AI',
        description:
          'Set in the heart of Hyderabad’s Financial and HITEC District, this campus is designed in partnership with leading enterprise cloud and AI firms, focusing on large-scale distributed architectures and MLOps pipelines.',
        facilities: [
          'High-Throughput Distributed Cloud Cluster',
          'Semiconductor & SoC Verification Station',
          'Collaborative Co-working Pods with Startup Mentors',
          'Media Production & Podcast Recording Studio',
          '24/7 Library & Quiet Deep-Work Pods',
          'Indoor Sports Complex & Swimming Pool',
        ],
        labs: [
          'Enterprise Cloud Architecture Lab',
          'NLP & Multimodal Foundation Model Lab',
          'Cybersecurity & Smart Contract Sandbox',
        ],
        hostelOptions: [
          {
            name: 'HITEC Single Suite (AC)',
            roomType: 'Single AC',
            annualFee: 220000,
            mealsIncluded: true,
            description: 'Private studio accommodation with ergonomic Herman Miller chair and high-speed Wi-Fi 6.',
          },
          {
            name: 'HITEC Twin Comfort (AC)',
            roomType: 'Twin Sharing AC',
            annualFee: 165000,
            mealsIncluded: true,
            description: 'Dual occupancy air-conditioned room with personalized study pods and daily nutritious catering.',
          },
        ],
        annualHostelFeeDefault: 165000,
        securityDeposit: 25000,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        address: 'Knowledge City, Sector 2, Gachibowli, Hyderabad, TS 500081',
        contactEmail: 'hyderabad.admissions@novatech.edu',
        contactPhone: '+91 40 6810 2400',
        availableSeats: 260,
        status: 'Admissions Open',
        featured: true,
      },
      {
        name: 'Pune Tech Valley',
        slug: 'pune-tech-valley',
        city: 'Pune',
        state: 'Maharashtra',
        tagline: 'Hinjawadi IT Park • Automotive & Embedded AI Hub',
        description:
          'Nestled near Pune’s premier engineering and manufacturing corridor, Pune Tech Valley combines cutting-edge robotics hardware with deep learning for autonomous mobility, robotics, and industrial IoT.',
        facilities: [
          'Autonomous EV Testing Track & Drone Enclosure',
          'Precision CNC & Rapid Prototyping Workshop',
          'Open-Air Amphitheatre & Hackathon Commons',
          '24/7 Cafeteria with Gourmet Healthy Dining',
          'High-Performance Workstation Suites (RTX 4090s)',
        ],
        labs: [
          'Autonomous Navigation & Sensor Fusion Lab',
          'Industrial IoT & Edge Intelligence Lab',
          'Embedded Linux & Kernel Engineering Lab',
        ],
        hostelOptions: [
          {
            name: 'Valley Single AC',
            roomType: 'Single AC',
            annualFee: 210000,
            mealsIncluded: true,
            description: 'Single occupancy air-conditioned room with garden view and dedicated study station.',
          },
          {
            name: 'Valley Twin Sharing AC',
            roomType: 'Twin Sharing AC',
            annualFee: 155000,
            mealsIncluded: true,
            description: 'Twin sharing room with high-efficiency climate control and complete meal plan.',
          },
        ],
        annualHostelFeeDefault: 155000,
        securityDeposit: 20000,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        address: 'Phase 3, Hinjawadi Rajiv Gandhi Infotech Park, Pune, MH 411057',
        contactEmail: 'pune.admissions@novatech.edu',
        contactPhone: '+91 20 7100 8900',
        availableSeats: 200,
        status: 'Admissions Open',
        featured: false,
      },
    ];

    const seededCampuses = await Campus.insertMany(campusesData);
    console.log(`[Seed] Seeded ${seededCampuses.length} Campuses.`);

    const campusMap = {};
    seededCampuses.forEach((c) => {
      campusMap[c.slug] = c._id;
    });

    // 3. Seed Programs
    const programsData = [
      {
        name: 'B.Tech Computer Science & AI (Systems Focus)',
        slug: 'btech-cse-ai',
        degree: 'B.Tech',
        duration: '4 Years (8 Semesters)',
        tagline: 'Master the full stack from bare metal and distributed kernels to modern LLM systems.',
        shortDescription:
          'A flagship 4-year undergraduate degree designed for engineers who want to build high-scale distributed software, modern cloud architectures, and production AI pipelines.',
        description:
          'Traditional computer science curriculums teach outdated theory with minimal production code. At NOVA, Computer Science & AI combines rigorous computational foundations with intense shipping cycles. From Year 1, students build real operating system components, distributed databases, high-throughput network engines, and LLM applications serving real internet traffic.',
        whoShouldChoose: [
          'Students who love building software from first principles and understanding how computer systems work under the hood.',
          'Aspiring engineers aiming for tier-1 tech firms (Google, OpenAI, Meta, Stripe) or high-growth venture-backed startups.',
          'Builders who prefer hands-on production code over rote memorization and outdated academic tests.',
        ],
        skills: [
          'Rust & Modern C++',
          'TypeScript & Full-Stack Systems',
          'Distributed Systems & Consensus',
          'Transformer Architecture & LLMOps',
          'Linux Kernel & OS Internals',
          'Database Internals & Vector Indices',
          'Kubernetes & Cloud Infrastructure',
        ],
        curriculumHighlights: [
          'Build your own Git, Redis, and OS kernel in Year 1 and 2',
          '6-Month mandatory paid Silicon Valley or Bangalore tech co-op in Year 3',
          'Incubate an open-source product or startup with institutional funding in Year 4',
        ],
        yearWiseCurriculum: [
          {
            year: 1,
            title: 'Foundations & First Shipped Products',
            theme: 'Computational Thinking & Web Architecture',
            focus: 'Low-level systems programming, clean code, data structures from scratch, modern web fundamentals, and deploying first production apps.',
            courses: [
              'CS101: Systems Programming in C and Rust',
              'CS102: Data Structures & Algorithmic Analysis',
              'CS103: Modern Web Architectures (TypeScript/Node.js)',
              'MATH101: Discrete Mathematics & Linear Algebra for AI',
            ],
            projects: [
              'Custom In-Memory Key-Value Store (Redis clone with RESP protocol)',
              'Full-Stack Collaborative Real-Time Code Canvas',
            ],
            outcomes: 'Ability to write performant memory-safe code, deploy containerized web services, and ship production applications.',
          },
          {
            year: 2,
            title: 'AI Systems & Core Infrastructure',
            theme: 'Deep Learning & Distributed Systems',
            focus: 'Neural networks from scratch, transformer architectures, database engine design, concurrency, and vector retrieval systems.',
            courses: [
              'CS201: Operating Systems & Virtualization Internals',
              'CS202: Distributed Systems & Consensus Algorithms',
              'AI201: Neural Networks & Deep Learning Foundations',
              'AI202: Vector Databases & High-Dimensional Search',
            ],
            projects: [
              'Multi-Node Raft Consensus Engine in Rust',
              'Local LLM Inference Engine with Quantized CUDA Kernels',
            ],
            outcomes: 'Architect scalable distributed services and build optimized AI model inference pipelines from scratch.',
          },
          {
            year: 3,
            title: 'Global Industry Immersion',
            theme: 'Co-Op & Open Source Engineering',
            focus: 'Full-time 6-month paid engineering residency at partner tech firms, advanced MLOps, security, and major open-source contributions.',
            courses: [
              'ENG301: 6-Month Full-Time Industry Co-Op Residency',
              'AI301: Large Language Model Systems & Agentic Workflows',
              'SEC301: Distributed Systems Security & Cryptography',
            ],
            projects: [
              'Enterprise-Grade RAG Pipeline processing >5k req/sec',
              'Tier-1 Open Source Framework Core Contribution',
            ],
            outcomes: 'Real-world engineering experience with high-scale production systems, corporate mentorship, and substantial stipend.',
          },
          {
            year: 4,
            title: 'Venture Incubation / Placement Capstone',
            theme: 'Commercial Product Launch or Top Placement',
            focus: 'Commercial product incubation at NOVA Venture Labs with institutional pre-seed capital, or premier engineering placement interviews.',
            courses: [
              'VEN401: Venture Architecture & Founder Economics',
              'CS401: Advanced Cloud Systems & Chaos Engineering',
              'CAP401: Graduation Capstone Defense & Product Demo Day',
            ],
            projects: [
              'Commercial SaaS / AI Product Launch with paying customers',
              'NeurIPS / ICML Research Paper or Peer-reviewed Architecture',
            ],
            outcomes: 'Graduate with an accredited degree, a verified portfolio of shipped work, equity in your venture, or offers from top global tech firms.',
          },
        ],
        careerPaths: [
          {
            role: 'AI Systems Engineer / LLMOps Architect',
            avgSalary: '₹24 LPA – ₹45 LPA',
            topHiringCompanies: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Uber AI', 'Sarvam AI'],
            description: 'Design, optimize, and serve large-scale AI models with minimal latency and high throughput.',
          },
          {
            role: 'Distributed Systems & Cloud Engineer',
            avgSalary: '₹22 LPA – ₹40 LPA',
            topHiringCompanies: ['Stripe', 'Amazon AWS', 'Cloudflare', 'Postman', 'Razorpay'],
            description: 'Build robust, fault-tolerant infrastructure and high-throughput data backbones.',
          },
          {
            role: 'Venture Founder / Product Engineer',
            avgSalary: '₹20 LPA – Unlimited (Venture Funded)',
            topHiringCompanies: ['NOVA Venture Labs', 'Y Combinator Backed Startups', 'Peak XV Surge'],
            description: 'Lead engineering and product architecture for high-growth tech ventures.',
          },
        ],
        fees: {
          tuitionPerYear: 320000,
          labFeePerYear: 40000,
          oneTimeAdmissionFee: 50000,
        },
        campuses: [campusMap['bengaluru-innovation-campus'], campusMap['hyderabad-ai-corridor'], campusMap['pune-tech-valley']],
        isActive: true,
        featured: true,
        seatsTotal: 160,
        badge: 'Top Choice',
      },
      {
        name: 'B.Tech Artificial Intelligence & Data Engineering',
        slug: 'btech-ai-data-engineering',
        degree: 'B.Tech',
        duration: '4 Years (8 Semesters)',
        tagline: 'Build foundation models, high-volume streaming data lakes, and production GenAI pipelines.',
        shortDescription:
          'Deep immersion into mathematical foundations of machine learning, modern neural architectures, real-time data streaming, and scalable AI infrastructure.',
        description:
          'Artificial Intelligence is transforming every layer of human industry. This program focuses on training, fine-tuning, and architecting real-world AI applications. You will work directly with large language models, computer vision systems, multimodal reasoning, and enterprise-grade data engineering stacks.',
        whoShouldChoose: [
          'Passionate learners who want to delve into machine learning math, neural networks, and generative intelligence.',
          'Engineers who want to build autonomous agents, recommendation engines, and high-throughput data platforms.',
          'Students with strong mathematical curiosity and ambition to build AI that impacts millions.',
        ],
        skills: [
          'Python & PyTorch',
          'CUDA & GPU Acceleration',
          'Data Streaming (Kafka, Flink)',
          'Vector DBs & Embeddings',
          'Agentic Workflows (LangGraph, AutoGen)',
          'Statistical Machine Learning',
          'MLOps & Model Observability',
        ],
        curriculumHighlights: [
          'Train transformer models on dedicated institutional GPU clusters',
          'Build end-to-end multimodal agent systems handling audio, text, and vision',
          'Direct mentorship from AI researchers at leading global labs',
        ],
        yearWiseCurriculum: [
          {
            year: 1,
            title: 'Mathematical Rigor & Data Foundations',
            theme: 'Linear Algebra, Probability & Python Engineering',
            focus: 'Probability, multivariable calculus, data structures, SQL & NoSQL data architectures, and automated data pipelines.',
            courses: [
              'MATH101: Linear Algebra & Matrix Calculus for ML',
              'MATH102: Probability, Statistics & Stochastic Processes',
              'CS101: Python for High-Performance Computing',
              'DB101: Relational & Columnar Database Architecture',
            ],
            projects: [
              'Automated High-Frequency Financial Data Scraper & Analytics Dashboard',
              'Custom Scientific Computing Library in Python/C',
            ],
            outcomes: 'Strong command of AI mathematics and industrial data ingestion pipelines.',
          },
          {
            year: 2,
            title: 'Neural Networks & Deep Learning',
            theme: 'Deep Models & Computer Vision / NLP',
            focus: 'Feedforward networks, CNNs, RNNs, Attention mechanisms, Transformers, PyTorch internals, and GPU kernel programming.',
            courses: [
              'AI201: Deep Learning Architectures & Optimization',
              'AI202: Computer Vision & Multimodal Perception',
              'AI203: Natural Language Processing & Attention Models',
              'CS202: Distributed Streaming with Apache Kafka',
            ],
            projects: [
              'Real-Time Multilingual Speech-to-Text & Translation Engine',
              'Custom Object Detection & Spatial Tracking Pipeline',
            ],
            outcomes: 'Train and fine-tune complex deep learning models on real-world datasets.',
          },
          {
            year: 3,
            title: 'Large Models, MLOps & Industry Co-Op',
            theme: 'LLM Systems & Production AI',
            focus: 'Pre-training, LoRA fine-tuning, RLHF, alignment, low-latency model quantization (vLLM, TensorRT-LLM), and paid industry co-op.',
            courses: [
              'AI301: Foundation Models, Fine-Tuning & Alignment',
              'ENG301: 6-Month Full-Time AI Engineering Co-Op',
              'OPS301: Production MLOps, CI/CD for Models & Monitoring',
            ],
            projects: [
              'Domain-Specific Healthcare Diagnostic LLM with Verifiable Citations',
              'High-Throughput Vector Search Engine with DiskANN',
            ],
            outcomes: 'Deploy enterprise-grade GenAI models with robust guardrails and production monitoring.',
          },
          {
            year: 4,
            title: 'Autonomous Agents & Research Capstone',
            theme: 'Frontier AI Research & Startup Defense',
            focus: 'Multi-agent coordination, reinforcement learning for reasoning, commercial prototype deployment, and investor demo day.',
            courses: [
              'AI401: Autonomous Agent Architectures & Tool Use',
              'AI402: Reinforcement Learning & Decision Systems',
              'CAP401: Senior Capstone Exhibition & Investor Pitch',
            ],
            projects: [
              'Autonomous Coding & Code-Refactoring AI Agent',
              'Open-source Diffusion Model for 3D Asset Generation',
            ],
            outcomes: 'Graduation with top-tier AI portfolio, published papers, or seed-funded AI startup.',
          },
        ],
        careerPaths: [
          {
            role: 'Applied AI / ML Engineer',
            avgSalary: '₹22 LPA – ₹42 LPA',
            topHiringCompanies: ['Microsoft Research', 'Amazon AWS AI', 'Swiggy AI Labs', 'PhonePe', 'Zomato AI'],
            description: 'Develop and productionize predictive and generative ML models.',
          },
          {
            role: 'Data Platform Architect',
            avgSalary: '₹20 LPA – ₹38 LPA',
            topHiringCompanies: ['Snowflake', 'Databricks', 'Target Tech', 'Walmart Global Tech'],
            description: 'Design massive real-time streaming architectures and lakehouses.',
          },
        ],
        fees: {
          tuitionPerYear: 310000,
          labFeePerYear: 45000,
          oneTimeAdmissionFee: 50000,
        },
        campuses: [campusMap['bengaluru-innovation-campus'], campusMap['hyderabad-ai-corridor']],
        isActive: true,
        featured: true,
        seatsTotal: 140,
        badge: 'High Demand',
      },
      {
        name: 'B.Tech Autonomous Systems & Robotics',
        slug: 'btech-autonomous-systems-robotics',
        degree: 'B.Tech',
        duration: '4 Years (8 Semesters)',
        tagline: 'Where physical hardware meets embodied artificial intelligence and real-time control.',
        shortDescription:
          'A specialized engineering program combining mechanical robotics, embedded systems, computer vision, ROS 2, and reinforcement learning for autonomous vehicles and quadrupeds.',
        description:
          'Robotics is shifting rapidly from static factory arms to embodied AI agents navigating dynamic human environments. At NOVA, students design PCB hardware, build custom actuators, program real-time RTOS microcontrollers, and run SLAM and navigation algorithms on physical autonomous rovers and drones.',
        whoShouldChoose: [
          'Builders fascinated by physical machines, drones, quadruped robots, and autonomous driving.',
          'Engineers who want to master both low-level hardware (C/C++, microcontrollers) and high-level perception (ROS 2, PyTorch).',
          'Innovators driven to solve real-world industrial and aerospace challenges.',
        ],
        skills: [
          'ROS 2 & Gazebo Simulation',
          'Embedded C/C++ & FreeRTOS',
          'LiDAR & Stereo Camera SLAM',
          'Reinforcement Learning for Control',
          'PCB Design (KiCad) & Hardware Bringup',
          'Control Theory (PID, MPC)',
          'Edge Computing (NVIDIA Jetson)',
        ],
        curriculumHighlights: [
          'Every student receives an autonomous rover kit in Semester 1',
          'Access to physical indoor/outdoor test tracks and motion capture arenas',
          'Co-ops with top automotive, defense, and robotics companies',
        ],
        yearWiseCurriculum: [
          {
            year: 1,
            title: 'Mechanical Design & Embedded Foundations',
            theme: 'Sensors, Actuators & Microcontrollers',
            focus: 'Kinematics, electrical circuits, microcontrollers (STM32/ESP32), CAD modeling, and 3D prototyping.',
            courses: [
              'ROB101: Introduction to Robotics & Embedded Systems',
              'EE101: Analog & Digital Circuit Design',
              'CS101: Modern C++ for Robotics',
              'ME101: CAD & Rapid Physical Prototyping',
            ],
            projects: [
              'Self-Balancing Inverted Pendulum Robot with Custom PCB',
              'Sensorized Smart Telemetry Ground Station',
            ],
            outcomes: 'Design custom circuits, write real-time firmware, and assemble functional robotic mechanisms.',
          },
          {
            year: 2,
            title: 'Robot Operating Systems & Perception',
            theme: 'ROS 2, Computer Vision & SLAM',
            focus: 'Robot operating system architecture, camera sensor pipelines, point cloud processing, and simultaneous localization and mapping.',
            courses: [
              'ROB201: ROS 2 Architecture & Distributed Nodes',
              'ROB202: Spatial Perception & Point Cloud Engineering',
              'MATH201: State Estimation (Kalman Filters, Particle Filters)',
              'CS202: Real-Time Operating Systems (FreeRTOS)',
            ],
            projects: [
              'Autonomous Indoor Navigation Rover with 2D LiDAR SLAM',
              'Computer Vision-Guided Robotic Arm with 6-DOF Inverse Kinematics',
            ],
            outcomes: 'Build autonomous mobile robots capable of mapping and navigating unknown environments.',
          },
          {
            year: 3,
            title: 'Embodied AI & Industrial Co-Op',
            theme: 'Reinforcement Learning & Field Robotics',
            focus: 'Sim-to-real transfer, deep reinforcement learning for locomotion, drone flight control, and 6-month industry residency.',
            courses: [
              'AI301: Reinforcement Learning for Robotic Control',
              'ENG301: 6-Month Full-Time Robotics Industry Co-Op',
              'ROB301: Drone Dynamics, Flight Stack & Trajectory Planning',
            ],
            projects: [
              'Quadruped Robot Locomotion with Sim-to-Real PyBullet Transfer',
              'Autonomous Drone for Search & Rescue with Thermal Imaging',
            ],
            outcomes: 'Deploy learned locomotion policies and autonomous flight algorithms on physical hardware.',
          },
          {
            year: 4,
            title: 'Commercial Robotic Systems & Capstone',
            theme: 'Autonomous Fleets & Defense Demonstration',
            focus: 'Multi-agent fleet coordination, functional safety standards, hardware venture incubation, and graduation showcase.',
            courses: [
              'ROB401: Multi-Robot Fleet Coordination & Swarm Systems',
              'VEN401: Hardware Productization & Supply Chain Logistics',
              'CAP401: Autonomous Robotics Capstone Defense',
            ],
            projects: [
              'Warehouse AGV Fleet with Multi-Agent Conflict-Free Pathfinding',
              'Agricultural Precision Spraying Drone System',
            ],
            outcomes: 'Graduate as an embodied AI robotics engineer or launch a hardware tech venture.',
          },
        ],
        careerPaths: [
          {
            role: 'Robotics Perception / Software Engineer',
            avgSalary: '₹18 LPA – ₹36 LPA',
            topHiringCompanies: ['Tesla Robotics', 'Boston Dynamics', 'Skydio', 'Ather Energy', 'Tata Elxsi'],
            description: 'Develop vision, localization, and trajectory planning software for autonomous platforms.',
          },
          {
            role: 'Embedded Systems & Firmware Architect',
            avgSalary: '₹16 LPA – ₹32 LPA',
            topHiringCompanies: ['Qualcomm', 'NVIDIA Embedded', 'Texas Instruments', 'Ola Electric'],
            description: 'Engineer high-reliability real-time controllers and device drivers.',
          },
        ],
        fees: {
          tuitionPerYear: 300000,
          labFeePerYear: 50000,
          oneTimeAdmissionFee: 50000,
        },
        campuses: [campusMap['bengaluru-innovation-campus'], campusMap['pune-tech-valley']],
        isActive: true,
        featured: false,
        seatsTotal: 100,
        badge: 'Hands-On Tech',
      },
      {
        name: 'B.Tech Product Engineering & FinTech',
        slug: 'btech-product-engineering-fintech',
        degree: 'B.Tech',
        duration: '4 Years (8 Semesters)',
        tagline: 'Engineer high-throughput transactional systems, modern Web3 protocols, and venture-scale SaaS.',
        shortDescription:
          'Bridging distributed software architecture, quantitative financial engineering, cryptography, and modern product management for future founders and lead engineers.',
        description:
          'Modern software companies need engineers who understand high-frequency databases, ledger consistency, payment rails, and product growth loops. This program combines software engineering rigor with financial systems and venture building.',
        whoShouldChoose: [
          'Aspiring tech founders, product architects, and quantitative engineers.',
          'Students interested in FinTech platforms, high-speed trading architectures, and large-scale SaaS systems.',
          'Builders who want both deep technical competence and strategic product intuition.',
        ],
        skills: [
          'Go & TypeScript',
          'Distributed Transaction Ledgers',
          'Event-Driven Architecture',
          'Financial Engineering & Algorithms',
          'Cryptography & Zero Knowledge',
          'High-Load PostgreSQL / Redis',
          'Product Analytics & Growth Loops',
        ],
        curriculumHighlights: [
          'Build an algorithmic trading engine and live payment gateway in Year 2',
          'Direct mentorship from FinTech unicorn founders (Stripe, Razorpay alumni)',
          'Pre-seed investment support through the NOVA Venture Fund',
        ],
        yearWiseCurriculum: [
          {
            year: 1,
            title: 'Modern Software Engineering & Economics',
            theme: 'Programming Paradigms & Financial Systems',
            focus: 'Go, TypeScript, modern databases, double-entry bookkeeping ledgers, and microservices.',
            courses: [
              'CS101: High-Performance Go Programming',
              'FIN101: Foundations of Financial Markets & Banking Architecture',
              'DB101: Relational ACID Transactions & Isolation Levels',
              'CS102: Data Structures & High-Efficiency Algorithms',
            ],
            projects: [
              'Double-Entry Immutable Accounting Ledger with REST API',
              'Personal Wealth & Portfolio Analytics Engine',
            ],
            outcomes: 'Build secure, fault-tolerant transactional backends with clean architecture.',
          },
          {
            year: 2,
            title: 'High-Concurrency & Trading Engines',
            theme: 'Distributed Ledgers & Low Latency',
            focus: 'Matching engines, WebSocket telemetry, order books, cryptographic signatures, and payment APIs.',
            courses: [
              'CS201: High-Frequency Order Book Architecture in Go/Rust',
              'FIN201: Quantitative Financial Modeling & Risk Engineering',
              'SEC201: Applied Cryptography & Zero-Knowledge Proofs',
              'CS202: Event-Driven Architectures with Kafka',
            ],
            projects: [
              'Sub-Millisecond Order Matching Engine with L2 Market Data',
              'Cross-Border Payment Settlement Simulator',
            ],
            outcomes: 'Construct low-latency order matching and secure payment rails.',
          },
          {
            year: 3,
            title: 'SaaS Architecture & Co-Op Residency',
            theme: 'Multi-Tenant Scale & FinTech Co-Op',
            focus: 'Multi-tenant database tenancy, enterprise compliance, automated billing engines, and 6-month paid residency.',
            courses: [
              'CS301: Multi-Tenant Cloud SaaS Architecture',
              'ENG301: 6-Month Paid Residency at FinTech Unicorn',
              'PROD301: Product Strategy, Metrics & Growth Engineering',
            ],
            projects: [
              'Enterprise Automated Subscription & Invoicing Platform',
              'AI-Driven Credit Risk & Underwriting Engine',
            ],
            outcomes: 'Experience building mission-critical financial software handling real monetary transactions.',
          },
          {
            year: 4,
            title: 'Venture Incubation & Launch',
            theme: 'Startup Accelerator & Institutional Demo Day',
            focus: 'Incubation at NOVA Venture Labs, customer acquisition, legal incorporation, investor term sheets, and product launch.',
            courses: [
              'VEN401: Venture Financing, Governance & Term Sheets',
              'CS401: High-Availability Resilient Cloud Architecture',
              'CAP401: Commercial Product Demo & Investor Presentation',
            ],
            projects: [
              'Live FinTech / B2B SaaS Product with Paying Business Users',
              'DeFi Liquidity Aggregation Protocol with Formal Verification',
            ],
            outcomes: 'Graduate with a profitable venture, seed backing, or premier placement in fintech engineering.',
          },
        ],
        careerPaths: [
          {
            role: 'Lead FinTech / Backend Systems Architect',
            avgSalary: '₹22 LPA – ₹44 LPA',
            topHiringCompanies: ['Stripe', 'Razorpay', 'Goldman Sachs Tech', 'CRED', 'Coinbase'],
            description: 'Architect secure transactional ledgers and high-volume payment backbones.',
          },
          {
            role: 'Quantitative Trading Systems Developer',
            avgSalary: '₹28 LPA – ₹60 LPA',
            topHiringCompanies: ['Tower Research', 'Jane Street', 'Graviton Research', 'WorldQuant'],
            description: 'Build low-latency execution algorithms and financial market connectivity.',
          },
        ],
        fees: {
          tuitionPerYear: 295000,
          labFeePerYear: 35000,
          oneTimeAdmissionFee: 50000,
        },
        campuses: [campusMap['bengaluru-innovation-campus'], campusMap['hyderabad-ai-corridor']],
        isActive: true,
        featured: false,
        seatsTotal: 100,
        badge: 'Venture Track',
      },
    ];

    const seededPrograms = await Program.insertMany(programsData);
    console.log(`[Seed] Seeded ${seededPrograms.length} Programs.`);

    const programMap = {};
    seededPrograms.forEach((p) => {
      programMap[p.slug] = p._id;
    });

    // Link programs to campuses
    await Campus.findByIdAndUpdate(campusMap['bengaluru-innovation-campus'], {
      programs: [
        programMap['btech-cse-ai'],
        programMap['btech-ai-data-engineering'],
        programMap['btech-autonomous-systems-robotics'],
        programMap['btech-product-engineering-fintech'],
      ],
    });
    await Campus.findByIdAndUpdate(campusMap['hyderabad-ai-corridor'], {
      programs: [
        programMap['btech-cse-ai'],
        programMap['btech-ai-data-engineering'],
        programMap['btech-product-engineering-fintech'],
      ],
    });
    await Campus.findByIdAndUpdate(campusMap['pune-tech-valley'], {
      programs: [
        programMap['btech-cse-ai'],
        programMap['btech-autonomous-systems-robotics'],
      ],
    });

    // 4. Seed Scholarships
    const scholarshipsData = [
      {
        name: 'NOVA Founders Merit Fellowship',
        slug: 'nova-founders-merit-fellowship',
        description: 'Prestigious 100% tuition waiver for the top 5% academic and algorithmic thinkers nationally.',
        percentage: 100,
        maxAmountPerYear: 0,
        criteria: [
          'Above 95% in 12th PCM / Science board examinations OR JEE Main Percentile > 98.5',
          'Demonstrated problem-solving agility in NOVA Technical Aptitude Challenge',
          'Passion for building technology products and continuous curiosity',
        ],
        category: 'Merit',
        eligibilityRules: {
          minPcm: 95,
          isWomenOnly: false,
          isNeedBased: false,
          familyIncomeCeiling: 0,
          isDefenseWard: false,
          hasCodingPortfolio: false,
        },
        badge: '100% Tuition Waiver',
        isActive: true,
        featured: true,
      },
      {
        name: 'Ada Lovelace Women in Tech Grant',
        slug: 'ada-lovelace-women-in-tech',
        description: '50% tuition waiver to champion exceptional female software engineers and AI researchers.',
        percentage: 50,
        maxAmountPerYear: 0,
        criteria: [
          'Female candidate with minimum 80% in 12th PCM',
          'Clear vision for impact in artificial intelligence or software engineering',
          'Successful completion of NOVA personal interview',
        ],
        category: 'Women in Tech',
        eligibilityRules: {
          minPcm: 80,
          isWomenOnly: true,
          isNeedBased: false,
          familyIncomeCeiling: 0,
          isDefenseWard: false,
          hasCodingPortfolio: false,
        },
        badge: '50% Waiver for Women',
        isActive: true,
        featured: true,
      },
      {
        name: 'Future Builder Need-Based Fellowship',
        slug: 'future-builder-need-based',
        description: 'Up to 75% tuition support for brilliant students with household income below ₹8 Lakhs/year.',
        percentage: 75,
        maxAmountPerYear: 0,
        criteria: [
          'Verified gross family annual income below ₹8,00,000 INR',
          'Minimum 75% in 12th PCM',
          'Passionate recommendation or portfolio of self-taught learning',
        ],
        category: 'Need-Based',
        eligibilityRules: {
          minPcm: 75,
          isWomenOnly: false,
          isNeedBased: true,
          familyIncomeCeiling: 800000,
          isDefenseWard: false,
          hasCodingPortfolio: false,
        },
        badge: 'Up to 75% Need Support',
        isActive: true,
        featured: true,
      },
      {
        name: 'NextGen AI Hacker & Portfolio Fellowship',
        slug: 'nextgen-ai-hacker-fellowship',
        description: '60% tuition waiver for verified builders with active GitHub repositories or shipped projects.',
        percentage: 60,
        maxAmountPerYear: 0,
        criteria: [
          'Active GitHub portfolio with shipped web/AI apps OR open source contributions',
          'Minimum 75% in 12th board examinations',
          'Technical demo interview with a NOVA engineering mentor',
        ],
        category: 'AI Fellowship',
        eligibilityRules: {
          minPcm: 75,
          isWomenOnly: false,
          isNeedBased: false,
          familyIncomeCeiling: 0,
          isDefenseWard: false,
          hasCodingPortfolio: true,
        },
        badge: 'Portfolio Builders 60%',
        isActive: true,
        featured: true,
      },
      {
        name: 'Armed Forces & Defense Wards Scholarship',
        slug: 'armed-forces-defense-wards',
        description: '40% tuition fee reduction for children of serving or retired defense and paramilitary personnel.',
        percentage: 40,
        maxAmountPerYear: 0,
        criteria: [
          'Ward of Indian Armed Forces (Army, Navy, Air Force) or Paramilitary personnel',
          'Minimum 70% in 12th PCM',
        ],
        category: 'Armed Forces',
        eligibilityRules: {
          minPcm: 70,
          isWomenOnly: false,
          isNeedBased: false,
          familyIncomeCeiling: 0,
          isDefenseWard: true,
          hasCodingPortfolio: false,
        },
        badge: '40% Defense Quota',
        isActive: true,
        featured: false,
      },
      {
        name: 'Regional Tech Pioneer Scholarship',
        slug: 'regional-tech-pioneer',
        description: '35% scholarship for standout students graduating from Tier-2 and Tier-3 cities.',
        percentage: 35,
        maxAmountPerYear: 0,
        criteria: [
          'High school education in non-metro district',
          'Minimum 82% in 12th PCM',
          'Demonstrated creative curiosity',
        ],
        category: 'Special Talent',
        eligibilityRules: {
          minPcm: 82,
          isWomenOnly: false,
          isNeedBased: false,
          familyIncomeCeiling: 0,
          isDefenseWard: false,
          hasCodingPortfolio: false,
        },
        badge: '35% Regional Talent',
        isActive: true,
        featured: false,
      },
    ];

    const seededScholarships = await Scholarship.insertMany(scholarshipsData);
    console.log(`[Seed] Seeded ${seededScholarships.length} Scholarships.`);

    // 5. Seed Mentors
    const mentorsData = [
      {
        name: 'Dr. Evelyn Vance',
        role: 'Research Scientist',
        company: 'Google DeepMind',
        expertise: ['Transformers', 'Large Language Models', 'Reinforcement Learning'],
        bio: 'Former post-doc at Stanford AI Lab. Leads reasoning architectures for next-generation Gemini models. Mentors NOVA students on deep generative models and scaling laws.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Stanford AI Lab', 'OpenAI Fellow'],
        featured: true,
        order: 1,
      },
      {
        name: 'Vikramaditya Sengupta',
        role: 'Staff Infrastructure Architect',
        company: 'Stripe',
        expertise: ['Distributed Systems', 'Raft Consensus', 'High-Throughput Go'],
        bio: 'Scaled Stripe payments ledger across multi-region AWS datacenters. Guides NOVA students through operating system kernels, distributed consensus, and zero-downtime database migrations.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['AWS S3 Core', 'Uber Core Infra'],
        featured: true,
        order: 2,
      },
      {
        name: 'Elena Rostova',
        role: 'Principal Robotics Lead',
        company: 'NVIDIA Robotics',
        expertise: ['ROS 2', 'Isaac Sim', 'Embodied AI', 'CUDA Acceleration'],
        bio: 'Spearheaded hardware acceleration for quadruped robots and autonomous navigation at NVIDIA. Regularly conducts hands-on hardware bringup workshops on campus.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Boston Dynamics', 'ETH Zurich'],
        featured: true,
        order: 3,
      },
      {
        name: 'Arjun Nambiar',
        role: 'Founder & CEO',
        company: 'Krypton Data (Y Combinator W24)',
        expertise: ['Venture Building', 'Vector Databases', 'Product Architecture'],
        bio: 'Started his company out of college, raised $4.2M from top Silicon Valley VCs. Mentors student founders inside the NOVA Venture Lab on zero-to-one validation.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Postman', 'Razorpay'],
        featured: true,
        order: 4,
      },
      {
        name: 'Dr. Clara Thorne',
        role: 'Senior Applied AI Researcher',
        company: 'Anthropic',
        expertise: ['Constitutional AI', 'Mechanistic Interpretability', 'RLHF'],
        bio: 'Researches inner representations of neural networks and alignment algorithms. Helps NOVA students design verifiable benchmarks for AI agents.',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['DeepMind', 'Oxford University'],
        featured: true,
        order: 5,
      },
      {
        name: 'Rohan Mehra',
        role: 'VP of Engineering',
        company: 'Razorpay',
        expertise: ['FinTech Systems', 'Event Streaming', 'Microservices'],
        bio: 'Oversees checkout and banking infrastructure processing billions in transaction volume. Lectures on high-availability transactional patterns at NOVA.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Flipkart', 'Yahoo!'],
        featured: false,
        order: 6,
      },
      {
        name: 'Maya Lin',
        role: 'Lead Kernel Engineer',
        company: 'Cloudflare',
        expertise: ['eBPF', 'Rust', 'Linux Kernel Internals', 'Edge Computing'],
        bio: 'Specializes in low-level packet processing with eBPF and XDP. Mentors students building high-speed network proxies and runtime security tools.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Red Hat', 'Mozilla'],
        featured: false,
        order: 7,
      },
      {
        name: 'Siddharth Iyer',
        role: 'Chief AI Architect',
        company: 'Sarvam AI',
        expertise: ['Indic LLMs', 'Speech Models', 'Model Quantization'],
        bio: 'Pioneering generative models optimized for Indian languages. Teaches fine-tuning on high-density GPU nodes and latency optimization.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Microsoft Research India', 'IISc Bangalore'],
        featured: false,
        order: 8,
      },
      {
        name: 'Ananya Deshmukh',
        role: 'Autonomous Flight Lead',
        company: 'Skydio',
        expertise: ['Drone Autonomy', 'Visual Inertial Odometry', 'C++'],
        bio: 'Builds autonomous obstacle avoidance pipelines for commercial drones. Instructs student teams competing in national drone championships.',
        image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['IIT Bombay Drone Lab', 'DJI Research'],
        featured: false,
        order: 9,
      },
      {
        name: 'Karthik Raman',
        role: 'Principal Cloud Architect',
        company: 'Databricks',
        expertise: ['Delta Lake', 'Spark Internals', 'Data Governance'],
        bio: 'Expert on distributed lakehouse storage engines and petabyte-scale data infrastructure. Advises on high-volume real-time ingestion.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        previousCompanies: ['Hortonworks', 'Cisco'],
        featured: false,
        order: 10,
      },
    ];

    const seededMentors = await Mentor.insertMany(mentorsData);
    console.log(`[Seed] Seeded ${seededMentors.length} Mentors.`);

    // 6. Seed Student Projects (15 projects across 6 categories)
    const projectsData = [
      {
        title: 'NovaKV: Distributed Raft-Backed Memory Engine',
        slug: 'novakv-distributed-raft-engine',
        tagline: 'High-throughput in-memory key-value database written in Rust with Raft consensus.',
        description:
          'NovaKV is an open-source distributed key-value store built in pure Rust from scratch. It implements the Raft consensus algorithm with dynamic cluster membership changes, log compaction, snapshotting, and sub-millisecond linearizable read operations.',
        problemStatement:
          'Distributed databases often struggle to balance memory safety, low tail latency, and strict consistency during network partitions.',
        solutionArchitecture:
          'Built using Tokio asynchronous runtime, custom write-ahead logging (WAL), zero-copy serialization with Bincode, and Prometheus metrics telemetry.',
        category: 'OPEN SOURCE',
        technology: ['Rust', 'Tokio', 'Raft Consensus', 'Prometheus', 'Docker'],
        students: [
          { name: 'Alex Rivers', role: 'Consensus & Core Engine Lead', github: 'https://github.com/alexrivers-code', batch: 'Class of 2026' },
          { name: 'Kunal Verma', role: 'Storage & WAL Architect', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/novakv-engine',
        liveUrl: 'https://novakv.dev',
        stats: { highlight: '1,420+ GitHub Stars', metricLabel: 'Used in 4 production startups' },
        featured: true,
        program: programMap['btech-cse-ai'],
      },
      {
        title: 'CortexRAG: Sub-50ms Multimodal Enterprise Retrieval',
        slug: 'cortex-rag-multimodal-retrieval',
        tagline: 'Enterprise-grade RAG pipeline combining Dense Passages with BM25 hybrid vector reranking.',
        description:
          'CortexRAG solves hallucination in enterprise documentation by indexing technical manuals, engineering schematics, and audio transcripts into a unified Qdrant vector space with dynamic Reciprocal Rank Fusion (RRF).',
        problemStatement:
          'Standard RAG pipelines fail on complex cross-modal queries containing tables, diagrams, and domain-specific code snippets.',
        solutionArchitecture:
          'FastAPI asynchronous server with PyTorch Colbertv2 rerankers, Vision-Transformer diagram parser, and streaming token delivery with SSE.',
        category: 'AI',
        technology: ['Python', 'PyTorch', 'FastAPI', 'Qdrant', 'HuggingFace Transformers', 'Next.js'],
        students: [
          { name: 'Priya Sharma', role: 'Lead AI Engineer', github: 'https://github.com/priyasharma-ai', batch: 'Class of 2026' },
          { name: 'Aditya Roy', role: 'Vector Search Specialist', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/cortex-rag',
        liveUrl: 'https://cortexrag.ai',
        stats: { highlight: '48ms Average Latency', metricLabel: 'Indexing 2.4M enterprise documents' },
        featured: true,
        program: programMap['btech-ai-data-engineering'],
      },
      {
        title: 'AeroQuad: Autonomous Vision-Guided Search & Rescue Drone',
        slug: 'aeroquad-vision-search-rescue-drone',
        tagline: 'Custom carbon-fiber drone equipped with onboard NVIDIA Jetson Orin running real-time SLAM.',
        description:
          'AeroQuad is a fully autonomous search and rescue aerial vehicle that can map GPS-denied collapsed buildings, detect victims using infrared thermal vision, and transmit 3D voxel point clouds to incident command centers.',
        problemStatement:
          'First responders entering hazardous disaster zones lack immediate spatial mapping and real-time survivor detection.',
        solutionArchitecture:
          'Custom PX4 flight stack on STM32, stereo visual inertial odometry (VIO) on Jetson Orin Nano, and thermal YOLOv8 for human detection.',
        category: 'ROBOTICS',
        technology: ['ROS 2', 'PX4 Autopilot', 'NVIDIA Jetson', 'C++', 'YOLOv8', 'KiCad'],
        students: [
          { name: 'Nikhil Kashyap', role: 'Flight Stack & Control Lead', github: 'https://github.com', batch: 'Class of 2025' },
          { name: 'Meera Nambisan', role: 'Computer Vision & SLAM', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/aeroquad-autonomous',
        liveUrl: 'https://aeroquad.tech',
        stats: { highlight: '1st Prize Winner', metricLabel: 'National Robotics Open 2025' },
        featured: true,
        program: programMap['btech-autonomous-systems-robotics'],
      },
      {
        title: 'FlowSync: Peer-to-Peer Real-Time Collaboration Engine',
        slug: 'flowsync-p2p-collaboration-engine',
        tagline: 'Local-first CRDT synchronization framework for canvas and document editing.',
        description:
          'FlowSync enables applications like Figma or Notion to operate entirely offline with zero server lock-in, using Conflict-free Replicated Data Types (Yjs-compatible) and WebRTC data channels for instant local peer mesh sync.',
        problemStatement:
          'Centralized collaboration software introduces high network latency and data loss when internet connectivity fluctuates.',
        solutionArchitecture:
          'Rust WebAssembly core compiled to browser, WebSockets signaling fallback, and IndexedDB local disk cache.',
        category: 'WEB',
        technology: ['TypeScript', 'Rust (Wasm)', 'CRDTs', 'WebRTC', 'Node.js', 'IndexedDB'],
        students: [
          { name: 'Devika Pillai', role: 'CRDT & Protocol Designer', github: 'https://github.com', batch: 'Class of 2026' },
          { name: 'Rohan Gupta', role: 'Frontend & Canvas Systems', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/flowsync-core',
        liveUrl: 'https://flowsync.dev',
        stats: { highlight: '85,000+ Downloads', metricLabel: 'NPM Package registry' },
        featured: true,
        program: programMap['btech-cse-ai'],
      },
      {
        title: 'LedgerZero: High-Frequency Settlement Ledger for FinTech',
        slug: 'ledgerzero-fintech-settlement-engine',
        tagline: 'Sub-millisecond transactional balance tracker with double-entry cryptographic verification.',
        description:
          'LedgerZero was incubated at NOVA Venture Labs and now processes payments for 14 e-commerce platforms across South Asia, handling up to 25,000 transactions per second on single commodity servers.',
        problemStatement:
          'Traditional relational databases face lock contention and race conditions under heavy concurrent financial writes.',
        solutionArchitecture:
          'LMAX Disruptor concurrency ring buffer in Go, PostgreSQL write-optimized append-only log, and Kafka audit streaming.',
        category: 'STARTUP',
        technology: ['Go (Golang)', 'PostgreSQL', 'Apache Kafka', 'Redis Cluster', 'Docker'],
        students: [
          { name: 'Siddharth Rao', role: 'Co-Founder & CEO', github: 'https://github.com', batch: 'Class of 2025' },
          { name: 'Ananya Krishnan', role: 'Co-Founder & CTO', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 4,
        thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/ledgerzero',
        liveUrl: 'https://ledgerzero.io',
        stats: { highlight: '₹4.5 Cr Seed Raised', metricLabel: 'Supported by Peak XV Surge' },
        featured: true,
        program: programMap['btech-product-engineering-fintech'],
      },
      {
        title: 'PulseOS: Real-Time Microkernel for IoT Devices',
        slug: 'pulseos-microkernel-iot',
        tagline: 'A clean-slate RISC-V microkernel with formal memory safety written in Rust.',
        description:
          'PulseOS is an ultra-lightweight microkernel designed to run on resource-constrained RISC-V and ARM microcontrollers, ensuring zero buffer-overflow vulnerabilities in critical industrial sensors.',
        problemStatement:
          'Embedded firmware written in legacy C frequently suffers from memory corruption bugs that compromise physical systems.',
        solutionArchitecture:
          'Capability-based security model with zero-allocation heap and microsecond context switching.',
        category: 'OPEN SOURCE',
        technology: ['Rust', 'RISC-V', 'ARM Cortex-M', 'GDB', 'QEMU'],
        students: [
          { name: 'Tanmay Bhatt', role: 'Kernel Architect', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/pulse-os',
        liveUrl: 'https://pulseos.tech',
        stats: { highlight: '520+ GitHub Stars', metricLabel: 'Featured on Hacker News Frontpage' },
        featured: false,
        program: programMap['btech-cse-ai'],
      },
      {
        title: 'MedVision AI: Automated Diabetic Retinopathy Screening',
        slug: 'medvision-ai-retinopathy-screening',
        tagline: 'Edge AI diagnostic tool running inference on fundus photographs without internet.',
        description:
          'Deployed across 12 rural clinics in Karnataka, MedVision processes ophthalmic retina scans on low-power tablets, grading retinopathy stages with 97.4% clinician-verified accuracy.',
        problemStatement:
          'Rural clinics lack trained ophthalmologists to detect early-stage diabetic vision loss before it causes permanent blindness.',
        solutionArchitecture:
          'Quantized EfficientNet model running on ONNX Runtime with mobile WebAssembly wrapper and offline patient database.',
        category: 'AI',
        technology: ['Python', 'PyTorch', 'ONNX Runtime', 'React Native', 'SQLite'],
        students: [
          { name: 'Varun Joshi', role: 'ML Researcher', github: 'https://github.com', batch: 'Class of 2025' },
          { name: 'Sneha Hegde', role: 'Clinical Deployment Lead', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/medvision-retina',
        liveUrl: 'https://medvision.org',
        stats: { highlight: '14,000+ Screenings', metricLabel: 'Deployed in 12 Rural Healthcare Centers' },
        featured: false,
        program: programMap['btech-ai-data-engineering'],
      },
      {
        title: 'VoltGrid: AI-Driven Microgrid Energy Optimization',
        slug: 'voltgrid-ai-microgrid-optimization',
        tagline: 'Dynamic renewable energy battery management platform utilizing predictive solar forecasting.',
        description:
          'VoltGrid uses transformer-based time series models to forecast rooftop solar yield and automatically arbitrate battery storage charge/discharge cycles against peak utility tariffs.',
        problemStatement:
          'Industrial campuses waste up to 30% of renewable solar power due to unscheduled battery depletion during tariff spikes.',
        solutionArchitecture:
          'Time-series transformer trained on weather telemetry, controlling smart inverter relays via Modbus TCP.',
        category: 'STARTUP',
        technology: ['Python', 'FastAPI', 'PyTorch Forecasting', 'Modbus TCP', 'Grafana', 'TimescaleDB'],
        students: [
          { name: 'Kavita Menon', role: 'Energy Systems Founder', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 4,
        thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/voltgrid-energy',
        liveUrl: 'https://voltgrid.energy',
        stats: { highlight: '₹18 Lakhs Saved', metricLabel: 'On NOVA Bengaluru Campus Pilot' },
        featured: false,
        program: programMap['btech-product-engineering-fintech'],
      },
      {
        title: 'RoboDex: 6-DOF Robotic Arm with Vision Feedback',
        slug: 'robodex-6dof-robotic-arm',
        tagline: 'Open-source 3D-printed robotic manipulator with sub-millimeter repeatable precision.',
        description:
          'A complete open-hardware robotic arm built for university research labs, costing less than $400 in off-the-shelf parts while offering trajectory planning and closed-loop visual servoing.',
        problemStatement:
          'Commercial robotic arms cost upwards of $15,000, creating a steep financial barrier for robotics education.',
        solutionArchitecture:
          'Custom cycloidal gearboxes 3D-printed in PETG, closed-loop stepper encoders, and ROS 2 MoveIt trajectory kinematics.',
        category: 'ROBOTICS',
        technology: ['ROS 2', 'MoveIt', 'C++', 'Python', 'Fusion 360', 'TMC5160 Steppers'],
        students: [
          { name: 'Aarav Patel', role: 'Mechanical & Kinematics Lead', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/robodex-arm',
        liveUrl: 'https://robodex.dev',
        stats: { highlight: 'Open Hardware', metricLabel: '120+ Community Builds Worldwide' },
        featured: false,
        program: programMap['btech-autonomous-systems-robotics'],
      },
      {
        title: 'ZenithPay: Offline Tap-to-Pay for Rural Merchants',
        slug: 'zenithpay-offline-tap-pay-mobile',
        tagline: 'Cryptographically secure zero-connectivity sound and NFC micro-payments.',
        description:
          'ZenithPay enables digital payments between smartphones in zero-network conditions using secure audio acoustic handshakes and signed time-locked cryptograms.',
        problemStatement:
          'Payment failures in rural India exceed 22% due to cellular dead zones and overloaded bank gateways.',
        solutionArchitecture:
          'Dual acoustic FSK modem and BLE mesh sync, signed with elliptic-curve Ed25519 cryptography.',
        category: 'MOBILE',
        technology: ['Flutter', 'Rust', 'WebAudio API', 'Ed25519 Cryptography', 'SQLite'],
        students: [
          { name: 'Manish Chawla', role: 'Mobile & Cryptography Lead', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/zenithpay-mobile',
        liveUrl: 'https://zenithpay.app',
        stats: { highlight: '3 Patents Filed', metricLabel: 'Supported by Reserve Bank Innovation Hub' },
        featured: false,
        program: programMap['btech-product-engineering-fintech'],
      },
      {
        title: 'OpenLLMOps: Zero-Overhead Local Model Benchmark Suite',
        slug: 'open-llmops-benchmark-suite',
        tagline: 'Automated performance profiling and perplexity evaluation for quantized local models.',
        description:
          'OpenLLMOps gives machine learning engineers an automated CLI tool to measure tokens-per-second, VRAM consumption, and needle-in-a-haystack recall across GGUF, AWQ, and EXL2 model quantizations.',
        problemStatement:
          'Quantized LLM benchmarks are fragmented and often mislead developers on actual inference throughput.',
        solutionArchitecture:
          'Python CLI tool interacting with llama.cpp C++ APIs, CUDA kernel timers, and Rich terminal rendering.',
        category: 'OPEN SOURCE',
        technology: ['Python', 'C++', 'CUDA', 'llama.cpp', 'Click CLI', 'Docker'],
        students: [
          { name: 'Gaurav Sen', role: 'Lead Contributor', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/open-llmops',
        liveUrl: 'https://openllmops.org',
        stats: { highlight: '920+ GitHub Stars', metricLabel: 'Integrated into Ollama pipelines' },
        featured: false,
        program: programMap['btech-cse-ai'],
      },
      {
        title: 'TraceRoute: Distributed Telemetry & eBPF Observability',
        slug: 'traceroute-ebpf-observability',
        tagline: 'Kernel-level distributed tracing with zero code instrumentation for cloud-native apps.',
        description:
          'TraceRoute captures every TCP packet, HTTP request, and database query directly inside the Linux kernel using eBPF probes, generating automatic distributed trace graphs without changing application code.',
        problemStatement:
          'Manual application tracing with OpenTelemetry requires extensive boilerplate and introduces CPU overhead.',
        solutionArchitecture:
          'C/eBPF kernel programs, Go userspace daemon, OpenTelemetry exporter, and React flamegraph visualizer.',
        category: 'OPEN SOURCE',
        technology: ['eBPF', 'C', 'Go (Golang)', 'OpenTelemetry', 'Grafana', 'React'],
        students: [
          { name: 'Karthik Somani', role: 'Kernel Systems Lead', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/traceroute-ebpf',
        liveUrl: 'https://traceroute.sh',
        stats: { highlight: 'Sub-1% CPU Overhead', metricLabel: 'Tested at 100k req/sec' },
        featured: false,
        program: programMap['btech-cse-ai'],
      },
      {
        title: 'SkyRoute: Autonomous Delivery Fleet Dispatcher',
        slug: 'skyroute-delivery-fleet-dispatcher',
        tagline: 'Multi-agent pathfinding algorithm avoiding dynamic air corridors for commercial delivery drones.',
        description:
          'SkyRoute coordinates simultaneous multi-drone deliveries in dense urban airspaces, dynamically updating flight corridors based on wind telemetry, bird migration paths, and emergency helipad clearances.',
        problemStatement:
          'Urban drone delivery fleets risk mid-air collision without centralized, deterministic trajectory arbitration.',
        solutionArchitecture:
          'Conflict-Based Search (CBS) algorithm in C++, WebSocket real-time fleet map, and PostGIS geofence layers.',
        category: 'ROBOTICS',
        technology: ['C++', 'PostGIS', 'Node.js', 'Mapbox GL', 'WebSockets', 'Docker'],
        students: [
          { name: 'Tanvi Agarwal', role: 'Algorithm Lead', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 3,
        thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/skyroute-dispatcher',
        liveUrl: 'https://skyroute.aero',
        stats: { highlight: 'Zero Collisions in 500k sims', metricLabel: 'Tested on Bengaluru GIS Data' },
        featured: false,
        program: programMap['btech-autonomous-systems-robotics'],
      },
      {
        title: 'VeriDoc: Zero-Knowledge Academic Credential Registry',
        slug: 'veridoc-zk-credential-registry',
        tagline: 'Cryptographically verifiable student transcripts and degree hashes with zero identity leakage.',
        description:
          'VeriDoc lets universities issue tamper-proof academic credentials that students can prove to employers (e.g., "I graduated with GPA > 3.8 in CS") without revealing full transcript records.',
        problemStatement:
          'Academic credential fraud costs recruiters thousands of hours in manual university verification.',
        solutionArchitecture:
          'Circom Zero-Knowledge SNARK circuits, Polygon smart contracts, and mobile credential wallet in Flutter.',
        category: 'WEB',
        technology: ['Circom', 'SnarkJS', 'Solidity', 'TypeScript', 'Flutter', 'IPFS'],
        students: [
          { name: 'Rahul Varma', role: 'ZK Cryptography Lead', github: 'https://github.com', batch: 'Class of 2025' },
        ],
        year: 4,
        thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/veridoc-zk',
        liveUrl: 'https://veridoc.id',
        stats: { highlight: 'Official NOVA Transcript Partner', metricLabel: 'Over 1,200 Degrees Verified' },
        featured: false,
        program: programMap['btech-product-engineering-fintech'],
      },
      {
        title: 'HyperDraft: AI-Assisted System Architecture Modeler',
        slug: 'hyperdraft-ai-architecture-modeler',
        tagline: 'Turns plain english product requirements into interactive distributed infrastructure blueprints.',
        description:
          'HyperDraft analyzes user system design prompts and synthesizes executable Terraform modules, microservice network diagrams, and database shard allocation formulas in seconds.',
        problemStatement:
          'Translating high-level software requirements into verified cloud architecture takes weeks of senior architect time.',
        solutionArchitecture:
          'Tree-of-thought LLM agent reasoning, React Flow canvas renderer, and automated HCL Terraform generator.',
        category: 'AI',
        technology: ['TypeScript', 'Next.js', 'React Flow', 'FastAPI', 'LangChain', 'Terraform HCL'],
        students: [
          { name: 'Aakash Singhal', role: 'Product Architect', github: 'https://github.com', batch: 'Class of 2026' },
        ],
        year: 2,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/nova-institute/hyperdraft',
        liveUrl: 'https://hyperdraft.ai',
        stats: { highlight: '4,200 Monthly Users', metricLabel: 'Used by engineers at 80+ startups' },
        featured: false,
        program: programMap['btech-cse-ai'],
      },
    ];

    const seededProjects = await Project.insertMany(projectsData);
    console.log(`[Seed] Seeded ${seededProjects.length} Projects.`);

    // 7. Seed Admission Events (Dynamic future & active dates)
    const now = new Date();
    const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'Priority Admissions Round (2026 Intake)',
        type: 'APPLICATION_DEADLINE',
        campusName: 'All Campuses (Bengaluru, Hyderabad, Pune)',
        startDate: daysFromNow(-10),
        endDate: daysFromNow(7), // 7 days from now
        description: 'Final date to submit early applications with 100% priority scholarship consideration.',
        actionUrl: '/student/application',
        actionText: 'Apply in Priority Round',
        isActive: true,
      },
      {
        title: 'NOVA Technical Aptitude & Logic Assessment',
        type: 'ASSESSMENT',
        campusName: 'Online Remote Evaluation',
        startDate: daysFromNow(8),
        endDate: daysFromNow(12),
        description: '60-minute practical algorithmic thinking and creative reasoning test for registered candidates.',
        actionUrl: '/admissions',
        actionText: 'View Assessment Guide',
        isActive: true,
      },
      {
        title: 'Bengaluru Innovation Campus Open House',
        type: 'CAMPUS_OPEN_HOUSE',
        campus: campusMap['bengaluru-innovation-campus'],
        campusName: 'Bengaluru Innovation Campus',
        startDate: daysFromNow(14),
        endDate: daysFromNow(15),
        description: 'Tour the 24/7 GPU compute cluster, interact with student founders, and meet visiting tech mentors.',
        actionUrl: '/campuses/bengaluru-innovation-campus',
        actionText: 'Reserve Open House Pass',
        isActive: true,
      },
      {
        title: 'Faculty & Industry Fellow 1-on-1 Interviews',
        type: 'INTERVIEW',
        campusName: 'Online Video Link',
        startDate: daysFromNow(16),
        endDate: daysFromNow(22),
        description: 'Technical portfolio discussion and personal alignment interviews for shortlisted applicants.',
        actionUrl: '/admissions',
        actionText: 'Interview Prep Guidelines',
        isActive: true,
      },
      {
        title: 'Formal Admission Offer & Scholarship Letters',
        type: 'ENROLLMENT',
        campusName: 'Admissions Portal',
        startDate: daysFromNow(23),
        endDate: daysFromNow(30),
        description: 'Official seat confirmation letters and scholarship award grants issued to accepted students.',
        actionUrl: '/fees',
        actionText: 'Calculate Fee & Enrollment',
        isActive: true,
      },
      {
        title: 'Hyderabad AI Corridor Tech Symposium',
        type: 'WEBINAR',
        campus: campusMap['hyderabad-ai-corridor'],
        campusName: 'Hyderabad AI Corridor',
        startDate: daysFromNow(32),
        endDate: daysFromNow(33),
        description: 'Keynote panel on "Building Production Generative AI Systems" featuring senior researchers from Google and OpenAI.',
        actionUrl: '/mentors',
        actionText: 'Register for Webinar',
        isActive: true,
      },
      {
        title: 'Regular Admissions Cycle Deadline',
        type: 'APPLICATION_DEADLINE',
        campusName: 'All Campuses',
        startDate: daysFromNow(35),
        endDate: daysFromNow(45),
        description: 'Regular admission window closure for academic year 2026-2027.',
        actionUrl: '/student/application',
        actionText: 'Start Application',
        isActive: true,
      },
      {
        title: 'NOVA National Student Hackathon 2026',
        type: 'CAMPUS_OPEN_HOUSE',
        campusName: 'Bengaluru & Hybrid',
        startDate: daysFromNow(50),
        endDate: daysFromNow(52),
        description: '36-hour sprint to build autonomous systems, with ₹10 Lakhs in grants and instant admission fast-track.',
        actionUrl: '/projects',
        actionText: 'Hackathon Details',
        isActive: true,
      },
    ];

    const seededEvents = await Event.insertMany(eventsData);
    console.log(`[Seed] Seeded ${seededEvents.length} Events.`);

    // 8. Seed Announcements
    const announcementsData = [
      {
        title: 'Admissions 2026 Priority Window',
        message: 'Applications for the 2026 Fall Intake are now open. Priority scholarship review closes in 7 days.',
        badge: 'ADMISSIONS 2026',
        link: '/admissions',
        linkText: 'Apply Now',
        priority: 10,
        startDate: daysFromNow(-5),
        endDate: daysFromNow(7),
        isActive: true,
      },
      {
        title: 'NOVA Venture Fund Announcement',
        message: 'NOVA Venture Lab announces ₹50 Lakhs initial seed pool dedicated to student-led AI startups.',
        badge: 'VENTURE LABS',
        link: '/about',
        linkText: 'Learn More',
        priority: 5,
        startDate: daysFromNow(-2),
        endDate: daysFromNow(20),
        isActive: true,
      },
    ];

    const seededAnnouncements = await Announcement.insertMany(announcementsData);
    console.log(`[Seed] Seeded ${seededAnnouncements.length} Announcements.`);

    // 9. Seed Sample Applications
    const sampleApplication1 = await Application.create({
      applicationId: 'NOVA-2026-004821',
      student: student1._id,
      personalInfo: {
        fullName: student1.name,
        email: student1.email,
        phone: student1.phone,
        dob: student1.profile.dob,
        gender: student1.profile.gender,
        guardianName: 'Robert Rivers',
        guardianPhone: '+91 98111 99887',
        address: student1.profile.address,
        city: student1.profile.city,
        state: student1.profile.state,
        pincode: student1.profile.pincode,
      },
      academicInfo: {
        highSchool: student1.profile.highSchool,
        board: student1.profile.board,
        yearOfPassing: 2026,
        pcmPercentage: student1.profile.pcmPercentage,
        mathMarks: 96,
        physicsMarks: 94,
        csMarks: 98,
        entranceExam: student1.profile.entranceExam,
        entranceScore: student1.profile.entranceScore,
        githubUrl: 'https://github.com/alexrivers-code',
        codingExperience: 'Intermediate (Built projects)',
      },
      preferences: {
        program: programMap['btech-cse-ai'],
        alternateProgram: programMap['btech-ai-data-engineering'],
        campus: campusMap['bengaluru-innovation-campus'],
        alternateCampus: campusMap['hyderabad-ai-corridor'],
        hostelRequired: true,
        scholarshipOptIn: true,
        claimedScholarship: seededScholarships[0]._id, // Merit
      },
      statementOfPurpose:
        'I have been writing code for three years, building in Rust and TypeScript. I want to build core operating systems and AI platforms rather than studying obsolete textbook syllabi.',
      careerGoal: 'To become a Staff AI Systems Architect or found a distributed infrastructure startup.',
      status: 'SUBMITTED',
      submittedAt: new Date(),
      timeline: [
        { stage: 'DRAFT', note: 'Application draft initiated', timestamp: daysFromNow(-2), updatedBy: 'Student' },
        { stage: 'SUBMITTED', note: 'Application submitted with verified academic scores and GitHub portfolio', timestamp: new Date(), updatedBy: 'Student' },
      ],
    });

    const sampleApplication2 = await Application.create({
      applicationId: 'NOVA-2026-004822',
      student: student2._id,
      personalInfo: {
        fullName: student2.name,
        email: student2.email,
        phone: student2.phone,
        dob: student2.profile.dob,
        gender: student2.profile.gender,
        guardianName: 'Sunita Sharma',
        guardianPhone: '+91 98222 99001',
        address: student2.profile.address,
        city: student2.profile.city,
        state: student2.profile.state,
        pincode: student2.profile.pincode,
      },
      academicInfo: {
        highSchool: student2.profile.highSchool,
        board: student2.profile.board,
        yearOfPassing: 2026,
        pcmPercentage: student2.profile.pcmPercentage,
        mathMarks: 98,
        physicsMarks: 95,
        csMarks: 99,
        entranceExam: student2.profile.entranceExam,
        entranceScore: student2.profile.entranceScore,
        githubUrl: 'https://github.com/priyasharma-ai',
        codingExperience: 'Advanced (Competitive / Open Source)',
      },
      preferences: {
        program: programMap['btech-ai-data-engineering'],
        alternateProgram: programMap['btech-cse-ai'],
        campus: campusMap['hyderabad-ai-corridor'],
        hostelRequired: true,
        scholarshipOptIn: true,
        claimedScholarship: seededScholarships[1]._id, // Women in Tech
      },
      statementOfPurpose:
        'My dream is to research foundation multimodal models that understand Indian languages and deploy edge AI models for community healthcare.',
      careerGoal: 'AI Research Scientist at frontier AI lab.',
      status: 'UNDER_REVIEW',
      submittedAt: daysFromNow(-1),
      timeline: [
        { stage: 'DRAFT', note: 'Application started', timestamp: daysFromNow(-3), updatedBy: 'Student' },
        { stage: 'SUBMITTED', note: 'Application submitted', timestamp: daysFromNow(-1), updatedBy: 'Student' },
        { stage: 'UNDER_REVIEW', note: 'Admissions committee commenced academic and portfolio verification', timestamp: new Date(), updatedBy: 'Admissions Officer' },
      ],
      adminNotes: 'Candidate has 96% PCM and solid multimodal project repository on GitHub. Recommend fast-track for assessment.',
    });

    // Save bookmarks for student1
    await User.findByIdAndUpdate(student1._id, {
      savedPrograms: [programMap['btech-cse-ai'], programMap['btech-ai-data-engineering']],
      savedCampuses: [campusMap['bengaluru-innovation-campus']],
      savedProjects: [seededProjects[0]._id, seededProjects[1]._id],
    });

    // 10. Seed Initial Enquiries
    const enquiriesData = [
      {
        name: 'Rahul Deshmukh',
        email: 'rahul.deshmukh@gmail.com',
        phone: '+91 97123 45678',
        subject: 'Inquiry regarding Hostel Accommodations and Single AC options',
        message: 'Hello, I wanted to know if single AC hostel rooms are guaranteed for first-year students at the Bengaluru campus.',
        programInterest: programMap['btech-cse-ai'],
        campusInterest: campusMap['bengaluru-innovation-campus'],
        status: 'NEW',
      },
      {
        name: 'Anita Sen',
        email: 'anita.sen@yahoo.com',
        phone: '+91 98300 12345',
        subject: 'Scholarship eligibility criteria for CBSE Board students',
        message: 'My daughter scored 96.2% in CBSE Class 12. Does she automatically qualify for the Founders Merit Fellowship?',
        programInterest: programMap['btech-ai-data-engineering'],
        campusInterest: campusMap['hyderabad-ai-corridor'],
        status: 'CONTACTED',
        adminNotes: 'Replied via email explaining that scoring >95% meets the primary requirement and invited for online assessment.',
      },
    ];

    const seededEnquiries = await Enquiry.insertMany(enquiriesData);
    console.log(`[Seed] Seeded ${seededEnquiries.length} Enquiries.`);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Admin Account:    ${process.env.ADMIN_EMAIL || 'admin@novatech.edu'} / ${process.env.ADMIN_PASSWORD || 'Admin@Nova2026!'}`);
    console.log(`Student 1:        alex.rivers@example.com / Student@12345 (App ID: NOVA-2026-004821)`);
    console.log(`Student 2:        priya.sharma@example.com / Student@12345 (App ID: NOVA-2026-004822)`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
