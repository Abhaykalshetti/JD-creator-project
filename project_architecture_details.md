# JD Creation Project Architecture & Functionality Document

## 1. Project Overview
The JD (Job Description) Creation Project is a full-stack web application designed to help recruiters and HR professionals generate, refine, cross-check, and manage high-quality job descriptions. It uses artificial intelligence (Google's Gemini 2.5 Flash model) to automate the writing process, suggest relevant skills, and evaluate the quality of the generated text.

## 2. Architecture & Technology Stack
The application is built using a modern decoupled architecture separated into a frontend client and a backend API server.

**Frontend (Client-Side):**
- **Framework:** React 19 managed with Vite (TypeScript).
- **Styling:** Vanilla CSS ([index.css](file:///d:/JD-Creation-project/frontend/src/index.css), [App.css](file:///d:/JD-Creation-project/frontend/src/App.css)).
- **HTTP Client:** Axios for communicating with the backend API.
- **Architecture Strategy:** Component-based UI. The main form ([JDForm.tsx](file:///d:/JD-Creation-project/frontend/src/components/JDForm.tsx)) captures user input and interacts with predefined domain states (templates) and triggers API calls.

**Backend (Server-Side):**
- **Framework:** NestJS (TypeScript), providing a structured, scalable module-based backend.
- **Database ORM:** TypeORM (configured for PostgreSQL, based on `pg` in dependencies).
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`) interacting with the `gemini-2.5-flash` model.
- **Architecture Strategy:** Follows Controller-Service-Repository pattern. Request routing is handled by controllers ([jd.controller.ts](file:///d:/JD-Creation-project/backend/src/jd/jd.controller.ts)), business logic and AI prompts are handled by services ([jd.service.ts](file:///d:/JD-Creation-project/backend/src/jd/jd.service.ts)), and data is persisted via TypeORM repositories.

## 3. Core Functionality & How It Works

The application provides several features to simplify JD creation:

### A. Role Templates (Frontend Pre-population)
- The frontend features predefined templates grouped by domain (e.g., Technology, Business, Operations, Creative).
- Clicking a template instantly auto-fills the job title, department, core skills, common responsibilities, and qualifications, overriding the current form state to speed up data entry.

### B. AI Skill Suggestions
1. **Flow:** If a recruiter gives a job title and experience level, they can click "AI Suggest Skills".
2. **Backend Logic:** The `/suggest-skills` endpoint prompts Gemini to act as a technical recruiter and suggest 10-12 additional skills tailored specifically to the role and experience tier.
3. **Response:** Parses a JSON array from the AI and renders them on the frontend as clickable chips that can be added to the current required skills.

### C. Auto-Fill Details (Responsibilities & Qualifications)
1. **Flow:** The user can click "Auto-Fill" to generate standard bullet points for responsibilities and qualifications.
2. **Backend Logic:** The `/suggest-req-qual` endpoint prompts Gemini to draft 6-8 bullet points for responsibilities and 4-6 for qualifications based on the job title, experience level, and currently selected skills.
3. **Response:** The AI returns structured JSON which is then mapped into the respective text areas in the frontend form.

### D. AI Job Description Generation
1. **Flow:** The user fills out a form containing all collected data (title, company, skills, location, responsibilities, etc.) and clicks "Generate Job Description".
2. **Backend Logic:** The `/generate` endpoint constructs a highly structured prompt.
3. **Variants Generation:** The AI executes this generation in parallel for three distinct tones: **Formal**, **Engaging**, and **Concise**, returning all three variants so the recruiter can choose the best cultural fit.

### E. AI JD Refinement (Iterative Improvement)
1. **Flow:** A unique capability where a user can provide natural language instructions against an already generated JD.
2. **Backend Logic:** The `/refine` endpoint sends the existing JD and the instruction back to Gemini. The model applies the instruction while preserving the original structure of the JD, returning the newly refined text.

### F. JD Quality Check
1. **Flow:** Once a JD is generated, the tool can run an automated audit on it.
2. **Backend Logic:** The `/check-quality` endpoint parses the JD text and asks Gemini to evaluate it based on completeness, clarity, specificity, tone, and candidate appeal.
3. **Response:** Returns a numerical quality score (0-100), a categorical grade (Excellent, Good, Fair, Poor), and an array of 3-5 actionable improvement suggestions.

### G. Saving and Managing JDs
- Generated and Refined Job Descriptions can be persisted to the PostgreSQL database.
- These can be fetched in a list (`GET /saved`), viewed individually (`GET /saved/:id`), or deleted (`DELETE /saved/:id`) using standard REST operations through the [JdController](file:///d:/JD-Creation-project/backend/src/jd/jd.controller.ts#21-77).
