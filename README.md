# Final Project Documentation

## Phase 1: System Analysis and Design

*Logical Connection: This phase sets the foundation of the project by explicitly defining the business case and visually modeling its interactions, ensuring a solid blueprint exists before technical software implementation begins.*

### 1. The topic and case study well formulated
- **Topic:** Web-based Lost and Found ID Card System.
- **Case Study Chosen:** University Campus Environment (Student and Staff IDs).

### 2. Functional Diagram indicating the internal working of the case study
*[Title: Functional Diagram]*
<br><br><br>

### 3. Brief statement clearly explaining the problem faced by the company
On a busy university campus, hundreds of students lose their identification cards each semester. The process of returning these cards is highly inefficient. Students have no centralized platform to report lost cards, and finders do not know where to register them. Matching finders with owners manually relies on untracked, error-prone paper systems, causing unnecessary delays and replacement costs. This system replaces that manual bottleneck with a digitally automated tracking platform.

### 4. Object Oriented system analysis and design diagrams
Below are the spaces allocated for the required UML diagrams indicating the structured system flow:

**1. Use case Diagram**
*[Title: Use Case Diagram]*
<br><br><br>

**2. Class Diagram**
*[Title: Class Diagram]*
<br><br><br>

**3. Activity Diagram**
*[Title: Activity Diagram]*
<br><br><br>

**4. Sequence Diagram**
*[Title: Sequence Diagram]*
<br><br><br>

**5. Component Diagram**
*[Title: Component Diagram]*
<br><br><br>

---

## Phase 2: Software Development Prototype

*Logical Connection: Following the theoretical UML blueprints designed in Phase 1, the abstract models were implemented into a tangible software prototype, strictly abiding by enterprise programming best practices to digitally solve the university's problem.*

### 1. A well-summarized software development prototype 
**1. Screens, forms, buttons, menus, Layout and design (colors, fonts, structure)**
The prototype features a responsive HTML/CSS interface with modern aesthetic layouts, readable typography, and clearly color-coded buttons (e.g., Primary actions vs. warnings). Menus easily separate the "Found" UI components from general "Reporting" elements.

**2. Input processing (e.g., login, search)**
Form submissions seamlessly require specific datasets (like an exact ID Number and a Village Code reference). Standardized REST API endpoints securely process and sanitize this data.

**3. Basic workflows (e.g., submitting forms)**
Submitting the "Report Lost ID" form automatically transmits the JSON payload, interacting with backend logic to instantly generate a tracking Claim in the database while linking the appropriate location hierarchy.

**4. Links between pages/screens**
HTML forms and Javascript DOM manipulations transition users between various application states, securely bridging the authentication window, main dashboard, and ID forms without full page reloads.

**5. User journeys (e.g., login → dashboard → logout)**
The journey flows logically in sequential steps: Access Landing Portal → Register Details as Owner/Finder → Login → View Dashboard Context.

**6. Simulated database responses**
Using native Javascript `fetch()` operations, the frontend dynamically simulates live asynchronous requests to the Spring Boot REST backend, querying and responding with actual data from a PostgreSQL database server.

### 2. Following software programming best practices
**1. Use of meaningful variable, class, and method names**
Extensive use of `UpperCamelCase` for entity classes (`LocationController`, `AuthRequest`) and descriptive `lowerCamelCase` for methods (`findByCardNumber()`) following stringent Java constraints.

**2. Use of Proper indentation and formatting**
The codebase relies on universally standardized 4-space indentations. Vertical Java packages are segmented accurately, and markup elements are nested cleanly using hierarchical semantic parameters.

**3. Codes were divided into functions, classes, or modules**
The Spring Boot backend utilizes separated layer abstraction. It is separated securely into architectural modules: `Controllers`, `Services`, `Repositories`, `Models`, and `DTOs`. Each file performs precisely ONE business requirement avoiding complexity.

**4. Comments were used to explain important logic**
Comments successfully outline the algorithmic decisions behind complex routines (like recursive tree-search locations traversing nested Provinces down to Villages), while deliberately ignoring over-commenting on standard setter features.

### 3. Checking software Design pattern used
**1. The Repository Pattern**
*How it was used:* The Spring Data JPA interfaces (`IDCardRepository`) completely isolate all direct SQL queries from backend business logic layers, meaning operations like `.existsByCardNumber()` function without hardcoding technical database definitions.
**2. Data Transfer Object (DTO) Pattern**
*How it was used:* Network structures like `AuthResponse` segregate internal `User` entity representations from the exact JSON payloads exposed to client networks.

---

## Phase 3: Dockerizing Software Application & Version Control

*Logical Connection: With the Phase 2 prototype functionally reliable, this stage ensures deployment parameters translate effortlessly across server environments through Docker and enforces code-safety through professional Git tracking.*

### 1. The software application was dockerized and how?
The application is securely containerized via a structured `Dockerfile` extracting an `eclipse-temurin:21-jdk-alpine` minimal image environment. This completely shields the native runtime setting from localized laptop issues. An orchestrated `docker-compose.yml` simultaneously pulls, initiates, and networks both the database PostgreSQL image and application container instantly.

### 2. Version Control System Configuration
- **Version Control System Installed:** Git was natively initialized throughout the repository enabling branching infrastructure.
- **Environment Prepared:** A secure `.gitignore` file was successfully installed strictly instructing Git to omit IDE-specific configs, system bloat metadata, compiled `/target` JVM binaries, and node modules, ensuring pristine repository tracking.

---

## Phase 4: Software Test Plan

*Logical Connection: The final phase guarantees the reliability of the Dockerized Phase 3 environment. It executes QA testing to prove that the original features directly solve the problems proposed conceptually in Phase 1 constraints.*

### 1. Are the goals of testing clearly defined? Do they align with system requirements?
Yes. The goals are strictly to validate the structural integrity of ID card status changes and geographical constraint mechanisms. Validating these boundaries perfectly aligns with achieving the "Use Cases" established originally in Phase 1 models.

### 2. Are the features to be tested clearly identified?
Yes. The identified features are:
1. Registration Payload Processing.
2. Multi-tier recursive location mapping (Province -> Village).
3. The specific status transition from `LOST` directly to `FOUND`.
4. Boundary rejections on missing inputs.

### 3. Are test cases clearly written and complete? Do they cover normal cases?
Yes, covering normal standard workflows comprehensively:

| Test Item | Tested Feature | Testing Action | Expected System Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Student Workflow | Complete web Registration as Student. | Profile writes, card initially updates to standard `LOST` status. |
| **TC-02** | Workflow Constraints | Send Registration payload containing blank Username payloads. | System handles cleanly tossing HTTP 400 bad constraints dynamically. |
| **TC-03** | Verification Transitions | Post Card Details through native Finder input panel. | Modifies respective ID tracker successfully to `FOUND` identity state. |
| **TC-04** | Hierarchy Output | Query all application users identified within Kigali framework. | API effectively executes algorithm yielding all nested regional outputs. |

### 4. Tools or methods for tracking issues
Issues are diagnosed primarily using **Spring Boot log traces**, whereby REST exception payloads write gracefully to `server_debug.log`. Version control methods strictly support tracking as **Git Checkouts** permit surgeons to pinpoint code reversions safely along timelines, maintaining stability structurally.
