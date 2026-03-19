import { useState, type KeyboardEvent } from 'react';
import type { FormData } from '../types';

type TemplateEntry = Partial<FormData> & { skills: string[]; icon: string };

const TEMPLATE_CATEGORIES: { label: string; icon: string; roles: string[] }[] = [
  { label: 'Technology', icon: '💻', roles: ['Software Engineer', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'UI/UX Designer', 'Data Scientist'] },
  { label: 'Business', icon: '💼', roles: ['Product Manager', 'Business Development Manager', 'Sales Executive', 'Finance Analyst', 'Project Manager'] },
  { label: 'People & Creative', icon: '🎯', roles: ['HR Manager', 'Content Writer', 'Social Media Manager', 'Graphic Designer', 'Brand Manager'] },
  { label: 'Operations', icon: '⚙️', roles: ['Operations Manager', 'Customer Success Manager', 'Logistics Coordinator', 'Supply Chain Analyst'] },
];

const TEMPLATES: Record<string, TemplateEntry> = {
  /* ── Technology ── */
  'Software Engineer': {
    icon: '👨‍💻', department: 'Engineering',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs'],
    responsibilities: 'Design and develop scalable software solutions\nWrite clean, well-tested, maintainable code\nCollaborate with cross-functional product and design teams\nParticipate in code reviews and architecture discussions\nTroubleshoot and debug production issues',
    qualifications: "Bachelor's degree in Computer Science or related field\n2+ years of software development experience\nStrong problem-solving and communication skills",
  },
  'Data Analyst': {
    icon: '📊', department: 'Data & Analytics',
    skills: ['SQL', 'Python', 'Power BI', 'Excel', 'Tableau', 'Statistics', 'Data Cleaning'],
    responsibilities: 'Analyze complex datasets to derive actionable business insights\nBuild interactive dashboards and reports\nCollaborate with stakeholders to define KPIs\nClean and transform raw data into structured formats\nPresent findings to senior leadership',
    qualifications: "Bachelor's degree in Statistics, Math, or related field\n2+ years of experience in data analysis\nProficiency in SQL and data visualization tools",
  },
  'DevOps Engineer': {
    icon: '🔧', department: 'Infrastructure',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins'],
    responsibilities: 'Design and maintain CI/CD pipelines\nManage cloud infrastructure on AWS/GCP/Azure\nAutomate deployment and monitoring processes\nEnsure high availability and system reliability\nCollaborate with development teams to improve deployment cycles',
    qualifications: "Bachelor's degree in Computer Science or equivalent\n3+ years of DevOps or SRE experience\nStrong scripting skills (Bash, Python)",
  },
  'QA Engineer': {
    icon: '🔍', department: 'Quality Assurance',
    skills: ['Selenium', 'Cypress', 'JIRA', 'API Testing', 'Postman', 'Test Automation'],
    responsibilities: 'Design and execute comprehensive test plans and test cases\nBuild and maintain automated test suites\nIdentify, document, and track software defects\nCollaborate with developers to resolve quality issues\nEnsure software meets quality standards before release',
    qualifications: "Bachelor's degree in CS or IT\n2+ years of QA engineering experience\nExperience with test automation frameworks",
  },
  'UI/UX Designer': {
    icon: '🎨', department: 'Design',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'],
    responsibilities: 'Create user-centred designs for web and mobile products\nConduct user research, interviews, and usability testing\nDevelop wireframes, prototypes, and high-fidelity mockups\nCollaborate with engineers to ensure pixel-perfect implementation\nMaintain and evolve the product design system',
    qualifications: "Bachelor's degree in Design, HCI, or related field\n2+ years of UI/UX design experience\nStrong portfolio demonstrating design thinking",
  },
  'Data Scientist': {
    icon: '🧠', department: 'Data Science',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Statistics', 'SQL', 'Data Visualization'],
    responsibilities: 'Build and deploy machine learning models for business problems\nConduct exploratory data analysis and feature engineering\nCollaborate with engineering teams to productionize models\nCommunicate insights and model performance to stakeholders\nResearch and implement cutting-edge ML algorithms',
    qualifications: "Master's or Bachelor's in Computer Science, Statistics, or related field\n2+ years of hands-on machine learning experience\nStrong mathematical and statistical foundation",
  },

  /* ── Business ── */
  'Product Manager': {
    icon: '🗺️', department: 'Product',
    skills: ['Product Strategy', 'Agile', 'JIRA', 'User Research', 'Roadmapping', 'Stakeholder Management', 'OKRs'],
    responsibilities: 'Define and own the product roadmap and strategy\nGather and prioritize product requirements from stakeholders\nWork closely with engineering, design, and business teams\nAnalyze market trends and competitive landscape\nDefine success metrics and track product performance',
    qualifications: "Bachelor's degree in Business, CS, or related field\n3+ years of product management experience\nStrong analytical and communication skills",
  },
  'Business Development Manager': {
    icon: '🤝', department: 'Business Development',
    skills: ['Lead Generation', 'CRM', 'Salesforce', 'Negotiation', 'Market Research', 'Partnership Management', 'B2B Sales'],
    responsibilities: 'Identify and develop new business opportunities and partnerships\nBuild and maintain strong relationships with clients and prospects\nNegotiate and close deals to meet revenue targets\nConduct market research and competitive analysis\nCollaborate with marketing and product teams on go-to-market strategies',
    qualifications: "Bachelor's degree in Business, Marketing, or related field\n3+ years of business development or sales experience\nStrong networking and negotiation skills",
  },
  'Sales Executive': {
    icon: '📈', department: 'Sales',
    skills: ['B2B Sales', 'CRM', 'Lead Generation', 'Cold Calling', 'Salesforce', 'Negotiation', 'Pipeline Management'],
    responsibilities: 'Meet and exceed monthly and quarterly sales targets\nProspect and qualify new leads through calls, emails, and networking\nPresent product demos and proposals to potential clients\nManage end-to-end sales cycle from lead to closure\nMaintain accurate records in CRM system',
    qualifications: "Bachelor's degree in Business, Marketing, or related field\n2+ years of B2B or B2C sales experience\nExcellent communication and persuasion skills",
  },
  'Finance Analyst': {
    icon: '💰', department: 'Finance',
    skills: ['Financial Modeling', 'Excel', 'Power BI', 'SAP', 'Budgeting', 'Forecasting', 'GAAP'],
    responsibilities: 'Prepare monthly, quarterly, and annual financial reports\nDevelop financial models and forecasts to support business decisions\nAnalyze variances between actuals and budget\nAssist in budgeting and long-range planning\nEnsure compliance with financial regulations and internal controls',
    qualifications: "Bachelor's degree in Finance, Accounting, or Economics\n2+ years of financial analysis experience\nProficiency in Excel and financial modeling",
  },
  'Project Manager': {
    icon: '📋', department: 'Project Management',
    skills: ['PMP', 'Agile', 'Scrum', 'MS Project', 'Risk Management', 'Stakeholder Communication', 'JIRA'],
    responsibilities: 'Plan, execute, and close projects on time and within budget\nCoordinate cross-functional teams and manage project resources\nIdentify and mitigate project risks proactively\nTrack project progress and report to senior stakeholders\nEnsure quality deliverables and adherence to scope',
    qualifications: "Bachelor's degree in Business, Engineering, or related field\nPMP or Agile certification preferred\n3+ years of project management experience",
  },

  /* ── People & Creative ── */
  'HR Manager': {
    icon: '👥', department: 'Human Resources',
    skills: ['Recruitment', 'HRIS', 'Employee Relations', 'Performance Management', 'Onboarding', 'Labor Law', 'Payroll'],
    responsibilities: 'Manage end-to-end recruitment and onboarding processes\nDevelop and implement HR policies and procedures\nHandle employee relations, grievances, and disciplinary actions\nAdminister payroll, benefits, and compensation programs\nDrive employee engagement, retention, and culture initiatives',
    qualifications: "Bachelor's degree in Human Resources, Business, or related field\n3+ years of HR management experience\nKnowledge of labor laws and HR best practices",
  },
  'Content Writer': {
    icon: '✍️', department: 'Marketing / Content',
    skills: ['Content Writing', 'SEO', 'WordPress', 'Copywriting', 'Blogging', 'Research', 'Editing'],
    responsibilities: 'Write engaging blog posts, articles, website copy, and social media content\nConduct keyword research and optimize content for SEO\nCollaborate with the marketing team on content strategy\nProofread and edit content produced by other team members\nTrack content performance metrics and refine based on data',
    qualifications: "Bachelor's degree in English, Journalism, Communications, or related field\n2+ years of professional content writing experience\nStrong command of written English and storytelling ability",
  },
  'Social Media Manager': {
    icon: '📱', department: 'Digital Marketing',
    skills: ['Social Media Strategy', 'Instagram', 'LinkedIn', 'Meta Ads', 'Canva', 'Content Calendar', 'Analytics'],
    responsibilities: 'Manage and grow company social media presence across platforms\nPlan and execute social media campaigns and content calendars\nEngage with community and respond to comments and messages\nAnalyze performance metrics and prepare monthly reports\nCollaborate with design team to create compelling visuals',
    qualifications: "Bachelor's degree in Marketing, Communications, or related field\n2+ years of social media management experience\nCreative mindset with eye for design and trends",
  },
  'Graphic Designer': {
    icon: '🖌️', department: 'Design / Creative',
    skills: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Canva', 'Typography', 'Branding', 'Print & Digital Design'],
    responsibilities: 'Design visual assets for marketing campaigns, social media, and brand materials\nDevelop brand guidelines and maintain visual consistency\nCollaborate with marketing and product teams on creative briefs\nPrepare print-ready files and digital assets for various platforms\nStay updated with design trends and industry best practices',
    qualifications: "Bachelor's degree in Graphic Design, Visual Arts, or related field\n2+ years of professional graphic design experience\nStrong portfolio showcasing diverse design skills",
  },
  'Brand Manager': {
    icon: '✨', department: 'Marketing',
    skills: ['Brand Strategy', 'Market Research', 'Campaign Management', 'Consumer Insights', 'Budget Management', 'ATL/BTL Marketing'],
    responsibilities: 'Develop and execute brand strategies to enhance market positioning\nManage brand campaigns across digital and traditional channels\nConduct market research and consumer insight studies\nOversee brand consistency across all touchpoints\nCollaborate with agencies, creative, and sales teams',
    qualifications: "Bachelor's degree in Marketing, Business, or related field\n3+ years of brand management experience\nStrong analytical and creative thinking skills",
  },

  /* ── Operations ── */
  'Operations Manager': {
    icon: '🏭', department: 'Operations',
    skills: ['Process Improvement', 'Lean Six Sigma', 'KPI Management', 'ERP', 'Budgeting', 'Team Leadership', 'Vendor Management'],
    responsibilities: 'Oversee day-to-day business operations and workflow efficiency\nDevelop and implement operational policies and procedures\nManage team performance, set goals, and conduct appraisals\nIdentify process inefficiencies and implement improvements\nCoordinate with department heads to align operational goals',
    qualifications: "Bachelor's degree in Business Administration, Operations, or related field\n4+ years of operations management experience\nStrong leadership and analytical skills",
  },
  'Customer Success Manager': {
    icon: '🌟', department: 'Customer Success',
    skills: ['CRM', 'Customer Retention', 'Onboarding', 'NPS', 'Upselling', 'Zendesk', 'Account Management'],
    responsibilities: 'Manage post-sale customer relationships and ensure high satisfaction\nOnboard new customers and drive product adoption\nMonitor customer health scores and proactively address churn risks\nIdentify upsell and cross-sell opportunities\nCollect and relay customer feedback to product and sales teams',
    qualifications: "Bachelor's degree in Business, Marketing, or related field\n2+ years of customer success or account management experience\nExcellent interpersonal and problem-solving skills",
  },
  'Logistics Coordinator': {
    icon: '🚚', department: 'Logistics & Supply Chain',
    skills: ['Supply Chain Management', 'ERP', 'Inventory Control', 'Freight Management', 'Customs Compliance', 'MS Excel', 'Vendor Negotiation'],
    responsibilities: 'Coordinate inbound and outbound shipments and deliveries\nLiaise with suppliers, freight forwarders, and customs agents\nMaintain inventory records and ensure accurate stock levels\nTrack and resolve logistics issues and delays\nPrepare shipping documentation and compliance reports',
    qualifications: "Bachelor's degree in Logistics, Supply Chain, or Business\n2+ years of logistics or supply chain coordination experience\nKnowledge of import/export regulations and freight operations",
  },
  'Supply Chain Analyst': {
    icon: '🔗', department: 'Supply Chain',
    skills: ['Supply Chain Analytics', 'SAP', 'Demand Forecasting', 'Excel', 'Power BI', 'Inventory Optimization', 'Procurement'],
    responsibilities: 'Analyze supply chain data to identify trends and inefficiencies\nSupport demand planning and inventory optimization initiatives\nPrepare reports on supply chain KPIs for management\nCollaborate with procurement and logistics teams\nDevelop recommendations to reduce costs and improve service levels',
    qualifications: "Bachelor's degree in Supply Chain, Business, or related field\n2+ years of supply chain analysis experience\nStrong data analysis and communication skills",
  },
};

interface JDFormProps {
  formData: FormData;
  skills: string[];
  suggestedSkills: string[];
  isGenerating: boolean;
  isSuggestingSkills: boolean;
  isSuggestingDetails: boolean;
  onChange: (field: keyof FormData, value: string) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onSetSkills: (skills: string[]) => void;
  onClearSuggestions: () => void;
  onGenerate: () => void;
  onSuggestSkills: () => void;
  onSuggestDetails: () => void;
}

export default function JDForm({
  formData, skills, suggestedSkills, isGenerating, isSuggestingSkills, isSuggestingDetails,
  onChange, onAddSkill, onRemoveSkill, onSetSkills, onClearSuggestions, onGenerate, onSuggestSkills, onSuggestDetails,
}: JDFormProps) {
  const [skillInput, setSkillInput] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('');

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      onAddSkill(skillInput.trim());
      setSkillInput('');
    }
    if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      onRemoveSkill(skills[skills.length - 1]);
    }
  };

  const applyTemplate = (name: string) => {
    const tpl = TEMPLATES[name];
    setActiveTemplate(name);
    // ✅ Clear everything first — no mixing of old template data
    onSetSkills(tpl.skills);            // replace skills entirely
    onClearSuggestions();               // wipe old AI suggestions
    onChange('department', tpl.department || '');
    onChange('responsibilities', tpl.responsibilities || '');
    onChange('qualifications', tpl.qualifications || '');
    // Also clear jobTitle so auto-suggest re-fires for this template role
    onChange('jobTitle', name);
  };

  const addedSet = new Set(skills.map((s) => s.toLowerCase()));

  return (
    <div className="form-panel">
      {/* Templates */}
      <div className="card">
        <div className="card-title"><span className="card-title-icon">⚡</span> Role Templates</div>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <div key={cat.label} style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {cat.icon} {cat.label}
            </div>
            <div className="template-grid">
              {cat.roles.map((name) => (
                <button
                  key={name}
                  id={`template-${name.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`template-btn ${activeTemplate === name ? 'active' : ''}`}
                  onClick={() => applyTemplate(name)}
                >
                  {TEMPLATES[name]?.icon} {name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Role Details */}
      <div className="card">
        <div className="card-title"><span className="card-title-icon">📋</span> Role Details</div>
        <div className="form-grid single" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Job Title <span>*</span></label>
            <input id="jobTitle" className="form-input" placeholder="e.g. Senior Backend Developer"
              value={formData.jobTitle} onChange={(e) => onChange('jobTitle', e.target.value)} />
          </div>
        </div>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input id="company" className="form-input" placeholder="e.g. TechNova Pvt Ltd"
              value={formData.company} onChange={(e) => onChange('company', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input id="department" className="form-input" placeholder="e.g. Engineering"
              value={formData.department} onChange={(e) => onChange('department', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input id="location" className="form-input" placeholder="e.g. Bangalore, India"
              value={formData.location} onChange={(e) => onChange('location', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Experience</label>
            <select id="experience" className="form-select" value={formData.experience} onChange={(e) => onChange('experience', e.target.value)}>
              <option value="">Select Level</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid">Mid-Level (3-5 years)</option>
              <option value="Senior">Senior (5-8 years)</option>
              <option value="Lead">Lead (8+ years)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Requirements */}
      <div className="card">
        <div className="card-title"><span className="card-title-icon">⚙️</span> Job Requirements</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select id="jobType" className="form-select" value={formData.jobType} onChange={(e) => onChange('jobType', e.target.value)}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option>
              <option>Internship</option><option>Freelance</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Work Mode</label>
            <select id="workMode" className="form-select" value={formData.workMode} onChange={(e) => onChange('workMode', e.target.value)}>
              <option>On-site</option><option>Remote</option><option>Hybrid</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Salary Range / CTC</label>
            <input id="salaryRange" className="form-input" placeholder="e.g. ₹8–12 LPA or $80k–$100k"
              value={formData.salaryRange} onChange={(e) => onChange('salaryRange', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <div className="card-title"><span className="card-title-icon">🛠️</span> Skills</div>
        <div className="skills-input-wrapper" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
          {skills.map((skill) => (
            <span key={skill} className="skill-chip">
              {skill}
              <button className="skill-chip-remove" onClick={() => onRemoveSkill(skill)}>×</button>
            </span>
          ))}
          <input
            id="skillInput"
            className="skills-text-input"
            placeholder={skills.length === 0 ? 'Type skill + Enter...' : ''}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
        </div>

        <button id="suggestSkillsBtn" className="suggest-skills-btn" onClick={onSuggestSkills}
          disabled={isSuggestingSkills || !formData.jobTitle}>
          {isSuggestingSkills ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Suggesting...</>
            : '✦ AI Suggest Skills'}
        </button>

        {suggestedSkills.length > 0 && (
          <div className="suggested-skills-panel">
            <div className="card-title" style={{ marginTop: 12 }}>Suggested Skills — click to add</div>
            <div className="suggested-chips">
              {suggestedSkills.map((skill) => {
                const isAdded = addedSet.has(skill.toLowerCase());
                return (
                  <button key={skill}
                    className={`suggested-chip ${isAdded ? 'added' : ''}`}
                    onClick={() => { if (!isAdded) onAddSkill(skill); }}
                    disabled={isAdded}
                  >
                    {isAdded ? '✓' : '+'} {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Responsibilities & Qualifications */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span><span className="card-title-icon">📝</span> Responsibilities & Qualifications</span>
          <button 
            className="suggest-skills-btn" 
            style={{ width: 'auto', margin: 0, padding: '4px 10px', fontSize: '0.75rem' }} 
            onClick={onSuggestDetails}
            disabled={isSuggestingDetails || !formData.jobTitle}
          >
            {isSuggestingDetails ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Generating...</> : '✦ Auto-Fill'}
          </button>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Key Responsibilities</label>
          <textarea id="responsibilities" className="form-textarea" rows={4}
            placeholder="Describe the main responsibilities of this role..."
            value={formData.responsibilities} onChange={(e) => onChange('responsibilities', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Qualifications Required</label>
          <textarea id="qualifications" className="form-textarea" rows={3}
            placeholder="e.g. Bachelor's degree in CS, 3+ years experience..."
            value={formData.qualifications} onChange={(e) => onChange('qualifications', e.target.value)} />
        </div>
      </div>

      {/* Generate Button */}
      <button id="generateBtn" className="generate-btn" onClick={onGenerate}
        disabled={isGenerating || !formData.jobTitle}>
        {isGenerating
          ? <><span className="spinner" /> Generating with AI...</>
          : <><span>✨</span> Generate Job Description</>}
      </button>
    </div>
  );
}
