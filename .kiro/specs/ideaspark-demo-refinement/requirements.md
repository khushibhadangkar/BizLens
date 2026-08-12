# Requirements Document

## Introduction

This feature transforms the existing BizLens application into a polished IdeaSpark Round 2 product demo by refining the current product UI and adding a new full-screen "Data Clarity Mode" presentation. The work preserves the existing Next.js/React/TypeScript architecture and all working functionality while elevating the visual design, improving user interactions, and adding an immersive product showcase that demonstrates BizLens's AI-powered decision intelligence capabilities through an interactive data journey from file upload through verification to decision-making.

**Core Product Thesis**: Analytics computes. LLM explains. Verification validates.

The demo experience intentionally transitions from a dark, rich, technical main application into a light, airy Data Clarity Mode that reveals the transparent data intelligence journey using white, soft blue, aqua, and mint tones, demonstrating: **AI Claim → Evidence → Independent Check → Verification Result → Decision**.

## Glossary

- **BizLens_Application**: The existing Next.js/React/TypeScript enterprise AI decision intelligence platform
- **Data_Clarity_Mode**: A new full-screen interactive presentation section featuring light theme, drag-and-drop file experience, and animated data pipeline visualization
- **Three_js_Scene**: The existing 3D wireframe network visualization rendered using Three.js and React Three Fiber
- **Dashboard_Component**: The existing interactive data visualization component displaying KPIs, charts, and CSV data
- **Pipeline_Visualization**: The interactive six-stage data processing workflow (Upload → Parse → Understand → Analyze → Verify → Decide)
- **Verification_Layer**: The existing core feature that independently checks AI-generated claims against source data
- **Existing_Data_Model**: The current data structures defined in lib/bizlens-data.ts including ledger rows, claims, and forecasts
- **Native_Drag_Drop**: Browser-native file drag-and-drop functionality without external dependencies
- **Framer_Motion**: The existing animation library for React components
- **Recharts_Library**: The existing charting library for data visualizations
- **Render_Backend**: The existing backend infrastructure referenced in the codebase
- **Glass_Panel_Style**: Visual design pattern using semi-transparent backgrounds with backdrop blur effects
- **Scroll_Driven_Animation**: Animations triggered and controlled by vertical scroll position using Framer Motion utilities or IntersectionObserver
- **Deterministic_Generation**: Dashboard and data visualization generation that follows consistent rules based on input data structure
- **Auditable_Evidence_Trail**: A transparent demonstration of claim → source → calculation/check → verification result

## Requirements

### Requirement 1: Refine Existing Product UI Visual Design

**User Story:** As a demo viewer, I want to see a premium professional visual design, so that the product appears polished and enterprise-ready.

#### Acceptance Criteria

1. THE BizLens_Application SHALL remove all neon glow effects and AI-generated aesthetic elements from the existing UI
2. THE BizLens_Application SHALL implement improved typography hierarchy with consistent font sizing, weight, and spacing
3. THE BizLens_Application SHALL refine the existing Three_js_Scene with improved colors, opacity, and animation timing rather than replacing it
4. THE BizLens_Application SHALL maintain all existing numerical correctness in data displays and calculations
5. THE BizLens_Application SHALL preserve the existing dark theme color palette for the main application sections
6. THE BizLens_Application SHALL use restrained shadows and borders instead of heavy glow effects
7. THE BizLens_Application SHALL ensure visual polish and animation enhance rather than overshadow the Verification_Layer

### Requirement 2: Enhance Dashboard Component Intelligence

**User Story:** As a product demo viewer, I want to see intelligent dashboard generation from real data, so that I understand how the system transforms raw data into insights.

#### Acceptance Criteria

1. THE Dashboard_Component SHALL generate visualizations deterministically from available structured business data
2. WHEN parsed or uploaded data is available, THE Dashboard_Component SHALL derive dashboard configuration from its fields and values
3. WHEN real uploaded data is unavailable, THE Dashboard_Component SHALL use BizLens demo data as a deterministic fallback
4. THE Dashboard_Component SHALL display KPI metrics calculated from parsedLedgerData with correct numerical values
5. THE Dashboard_Component SHALL render revenue trends using the novaRetail forecast data array
6. THE Dashboard_Component SHALL show anomaly indicators for records with status 'conflict' in the data model
7. THE Dashboard_Component SHALL implement smooth transitions when switching between dashboard tabs
8. THE Dashboard_Component SHALL NOT fabricate business numbers or metrics not derived from structured data

### Requirement 3: Implement Native Drag-and-Drop File Upload

**User Story:** As a demo viewer, I want to experience native drag-and-drop file interaction, so that I can see the intuitive file upload workflow.

#### Acceptance Criteria

1. THE BizLens_Application SHALL implement Native_Drag_Drop using browser onDrop and onDragOver events
2. WHEN a user drags CSV, XLSX, or PDF files over the drop zone, THE BizLens_Application SHALL display visual feedback with border highlight
3. WHEN a user drops valid files, THE BizLens_Application SHALL add them to the files state array
4. WHEN a user drops invalid file types, THE BizLens_Application SHALL display a validation message
5. THE BizLens_Application SHALL filter accepted files to CSV, XLSX, XLS, and PDF extensions using regex pattern /\.(csv|xlsx?|pdf)$/i
6. THE BizLens_Application SHALL avoid adding new external file upload dependencies

### Requirement 4: Strengthen Claim Verification UI

**User Story:** As a demo viewer, I want to see a clear and compelling verification workflow, so that I understand the value of the verification layer.

#### Acceptance Criteria

1. THE Verification_Layer UI SHALL display verification status and evidence prominently with clear typography and color coding
2. WHEN implemented verification logic produces confidence scores, THE Verification_Layer SHALL display them
3. THE Verification_Layer SHALL NOT invent, hardcode, or fabricate confidence percentages when verification logic is absent
4. WHEN a verification is running, THE Verification_Layer SHALL show step-by-step progress through evidence layers
5. THE Verification_Layer SHALL display verified claims with emerald-themed styling
6. THE Verification_Layer SHALL display conflict-flagged claims with amber-themed styling
7. THE Verification_Layer SHALL show evidence source citations with file names and line numbers
8. THE Verification_Layer SHALL preserve all existing verification logic and timing intervals

### Requirement 5: Create Data Clarity Mode Section

**User Story:** As a demo viewer, I want to experience an immersive Data Clarity Mode presentation, so that I understand the complete BizLens data intelligence journey.

#### Acceptance Criteria

1. THE BizLens_Application SHALL create a new full-screen Data_Clarity_Mode section at the end of the landing page
2. THE Data_Clarity_Mode SHALL transition from the dark BizLens theme to a light off-white background with a distinct visual identity
3. THE Data_Clarity_Mode SHALL use a soft color palette including white, blue, aqua, and mint tones to create a "data clarity reveal" experience
4. THE Data_Clarity_Mode SHALL implement Glass_Panel_Style components with light backgrounds and subtle shadows
5. THE Data_Clarity_Mode SHALL span the full viewport height for each major subsection
6. THE Data_Clarity_Mode SHALL maintain accessibility with sufficient color contrast ratios
7. THE light visual system SHALL feel like an intentional design choice, not an accidental theme change

### Requirement 6: Build Interactive File Experience in Data Clarity Mode

**User Story:** As a demo viewer, I want to interact with visual file representations that transform into data, so that I see the data ingestion concept clearly.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL display interactive file cards representing CSV, XLSX, and PDF business files
2. WHEN a user interacts with file cards, THE Data_Clarity_Mode SHALL show visual transitions using Framer_Motion
3. THE Data_Clarity_Mode SHALL animate file cards transforming into data table previews or data point visualizations
4. THE Data_Clarity_Mode SHALL implement Native_Drag_Drop for file cards with smooth drag animations
5. THE Data_Clarity_Mode SHALL use Lucide icons for file type representation
6. THE Data_Clarity_Mode SHALL avoid fabricating business numbers or file content not in Existing_Data_Model

### Requirement 7: Create Central Interactive Pipeline Visualization

**User Story:** As a demo viewer, I want to explore the six-stage data pipeline interactively, so that I understand how BizLens processes business information.

#### Acceptance Criteria

1. THE Pipeline_Visualization SHALL display six clickable stages: Upload → Parse → Understand → Analyze → Verify → Decide
2. WHEN a user clicks a pipeline stage, THE Pipeline_Visualization SHALL display detailed hover information about that stage
3. WHEN a user hovers over a pipeline stage, THE Pipeline_Visualization SHALL highlight the stage with border and background transitions
4. THE Pipeline_Visualization SHALL show animated data-flow connections between stages using SVG paths or Framer_Motion lines
5. THE Pipeline_Visualization SHALL render stages horizontally on desktop and vertically on mobile responsive layouts
6. THE Pipeline_Visualization SHALL use consistent stage icons from the Lucide library

### Requirement 8: Implement Scroll-Driven Stage Progression

**User Story:** As a demo viewer, I want the pipeline stages to activate as I scroll, so that I experience the data journey progressively.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL use Framer_Motion utilities or IntersectionObserver where appropriate to determine active presentation stages
2. THE Data_Clarity_Mode SHALL avoid unnecessary global window scroll listeners
3. WHEN the user scrolls to each pipeline stage section, THE Data_Clarity_Mode SHALL activate that stage with Scroll_Driven_Animation
4. WHEN a stage becomes active, THE Data_Clarity_Mode SHALL highlight the stage and display associated content
5. THE Data_Clarity_Mode SHALL implement smooth easing transitions
6. THE Data_Clarity_Mode SHALL properly clean up any observers or event subscriptions when components unmount

### Requirement 9: Display Animated Dashboard Reveal with Real Data

**User Story:** As a demo viewer, I want to see the dashboard materialize with real data animations, so that I see the output of the pipeline clearly.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL display a dashboard preview using available parsed/uploaded business data, with Existing_Data_Model as a deterministic fallback
2. WHEN the dashboard section enters the viewport, THE Data_Clarity_Mode SHALL animate KPI numbers with count-up effects
3. THE Data_Clarity_Mode SHALL show revenue trends using the novaRetail forecast array
4. THE Data_Clarity_Mode SHALL display anomaly indicators derived from structured data in the data model
5. THE Data_Clarity_Mode SHALL render mini chart previews using Recharts_Library components
6. THE Data_Clarity_Mode SHALL use Framer_Motion initial and animate properties for staggered reveals

### Requirement 10: Integrate BizLens Copilot Interaction

**User Story:** As a demo viewer, I want to see a sample copilot Q&A interaction, so that I understand the natural language query capability.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL display a copilot interface section with a sample question
2. THE Data_Clarity_Mode SHALL use a predefined sample question from copilotAnswers such as "Why did margin move?"
3. WHEN the copilot section is visible, THE Data_Clarity_Mode SHALL animate the answer text appearing with typing effect or fade-in
4. THE Data_Clarity_Mode SHALL display the answer from copilotAnswers dictionary matching the sample question
5. THE Data_Clarity_Mode SHALL show visual connection to source evidence with file name citations
6. THE Data_Clarity_Mode SHALL avoid fabricating AI responses not present in the Existing_Data_Model

### Requirement 11: Visualize Data Lineage and Auditable Evidence Trail

**User Story:** As a demo viewer, I want to see the data lineage visually, so that I understand how claims trace back to source data.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL demonstrate the Auditable_Evidence_Trail showing claim → source → calculation/check → verification result
2. THE Data_Clarity_Mode SHALL display a visual lineage diagram connecting files → data → claims → decisions
3. THE Data_Clarity_Mode SHALL render lineage connections using SVG paths, lines, or Framer_Motion animated elements
4. THE Data_Clarity_Mode SHALL highlight the evidence trail for a sample verified claim from novaRetail.claims array
5. THE Data_Clarity_Mode SHALL show file icons, data table snippets, and claim cards connected visually
6. THE Data_Clarity_Mode SHALL use directional arrows or flow lines to indicate data transformation direction
7. THE Data_Clarity_Mode SHALL maintain readability with sufficient spacing and clear visual hierarchy

### Requirement 12: Emphasize Transparent Verification Process

**User Story:** As a demo viewer, I want to see that the system is transparent, so that I trust the verification methodology.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL demonstrate transparency and provenance without exposing private model reasoning
2. THE Data_Clarity_Mode SHALL display verification status and evidence prominently
3. THE Data_Clarity_Mode SHALL render source file citations visibly next to every claim
4. THE Data_Clarity_Mode SHALL use open/transparent visual metaphors
5. THE Data_Clarity_Mode SHALL avoid black-box or hidden processing visual representations
6. THE Data_Clarity_Mode SHALL display confidence scores only when produced by implemented logic

### Requirement 13: Present Final Closing Statement

**User Story:** As a demo viewer, I want to see a compelling closing message, so that I remember the core value proposition.

#### Acceptance Criteria

1. THE Data_Clarity_Mode SHALL display a final full-screen closing section
2. THE Data_Clarity_Mode SHALL show the statement "Stop searching through data. Start making decisions."
3. THE Data_Clarity_Mode SHALL show the brand statement "BIZLENS — AI-Powered Decision Intelligence"
4. THE Data_Clarity_Mode SHALL center the text vertically and horizontally in the viewport
5. THE Data_Clarity_Mode SHALL use large typography for maximum impact
6. THE Data_Clarity_Mode SHALL maintain the light theme color palette established in Data Clarity Mode

### Requirement 14: Preserve Existing Architecture and Dependencies

**User Story:** As a developer, I want to maintain the existing technical architecture, so that the system remains stable and maintainable.

#### Acceptance Criteria

1. THE BizLens_Application SHALL preserve the Next.js application structure with app directory routing
2. THE BizLens_Application SHALL continue using React 19, TypeScript 5.7, and Tailwind CSS 4.3
3. THE BizLens_Application SHALL maintain existing dependencies: Framer_Motion, Recharts_Library, Lucide icons, React Three Fiber
4. THE BizLens_Application SHALL avoid adding unnecessary new npm packages
5. THE BizLens_Application SHALL preserve all existing TypeScript interfaces and data models in lib/bizlens-data.ts
6. THE BizLens_Application SHALL keep all existing component files and only add new components for Data_Clarity_Mode

### Requirement 15: Maintain Integration with Render Backend

**User Story:** As a developer, I want to preserve backend integration points, so that real API functionality is not disrupted.

#### Acceptance Criteria

1. THE BizLens_Application SHALL inspect existing code for Render_Backend API endpoint references
2. WHERE a verified backend endpoint and contract are available, THE BizLens_Application SHALL use the real backend
3. WHEN the corresponding backend functionality or uploaded data is unavailable, THE BizLens_Application SHALL use existing demo data as a fallback
4. THE BizLens_Application SHALL NOT invent endpoints or fake responses not present in the codebase
5. THE BizLens_Application SHALL avoid fabricating backend functionality
6. THE BizLens_Application SHALL document any backend integration requirements if discovered during inspection

### Requirement 16: Ensure Performance and Accessibility

**User Story:** As a user, I want the application to perform well and be accessible, so that all users can interact with the demo effectively.

#### Acceptance Criteria

1. THE BizLens_Application SHALL maintain smooth animations at 60fps by using CSS transforms and GPU-accelerated properties
2. THE BizLens_Application SHALL implement lazy loading for the Data_Clarity_Mode section if it impacts initial page load
3. THE BizLens_Application SHALL provide keyboard navigation for all interactive pipeline stages and controls
4. THE BizLens_Application SHALL include ARIA labels and semantic HTML for screen reader accessibility
5. THE BizLens_Application SHALL respect prefers-reduced-motion media query for users who disable animations
6. THE BizLens_Application SHALL maintain WCAG 2.1 AA color contrast ratios in both dark and light themes

### Requirement 17: Preserve Verification Layer as Core Differentiator

**User Story:** As a product stakeholder, I want the verification layer to remain the central product feature, so that the unique value proposition is clear.

#### Acceptance Criteria

1. THE BizLens_Application SHALL clearly demonstrate the core product thesis: AI Claim → Evidence → Independent Check → Verification Result → Decision
2. THE BizLens_Application SHALL highlight the Verification_Layer in both the existing UI and Data_Clarity_Mode
3. THE Data_Clarity_Mode SHALL dedicate at least one full section to explaining and demonstrating verification
4. THE BizLens_Application SHALL show verification confidence scores prominently throughout the demo when produced by implemented logic
5. THE BizLens_Application SHALL visually distinguish verified claims from conflict-flagged claims
6. THE BizLens_Application SHALL demonstrate the evidence checking workflow with step-by-step progression
7. THE BizLens_Application SHALL maintain the existing verification timing intervals and logic from the current codebase
