// schema.prisma
// Database: PostgreSQL
// ORM: Prisma
// Generated for: AI Sales Call Coach MVP

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum PlatformRole {
  SUPER_ADMIN // Full system control
  MANAGER     // Platform-level operations, no infra config
}

enum OrganizationRole {
  ADMIN        // Owns organization, billing, knowledge base
  ORG_MANAGER  // Manages team, reviews analytics, coaches reps
  SALES_PERSON // Attends calls, receives feedback
}

enum MeetingStatus {
  SCHEDULED   // Meeting scheduled but not started
  IN_PROGRESS // Bot joined, actively capturing
  COMPLETED   // Meeting ended, transcript available
  FAILED      // Bot failed to join or capture
  CANCELLED   // Meeting cancelled before start
}

enum AnalysisStatus {
  PENDING    // Queued for analysis
  PROCESSING // AI analysis in progress
  COMPLETED  // Analysis finished successfully
  FAILED     // Analysis failed
}

enum TransactionType {
  CREDIT        // Funds added to wallet
  DEBIT         // Funds deducted (meeting analysis)
  REFUND        // Funds returned
  ADMIN_ADJUSTMENT // Manual adjustment by super_admin
}

enum BuyerPersona {
  PROSPECT           // Cold call prospect
  SKEPTICAL_BUYER    // Objection-heavy buyer
  TECHNICAL_EVALUATOR // Deep technical questions
  BUDGET_CONSCIOUS   // Price-focused buyer
  DECISION_MAKER     // C-level executive
}

enum DocumentType {
  PRODUCT_DOC    // Product documentation
  VALUE_PROP     // Value propositions
  FAQ            // Frequently asked questions
  CASE_STUDY     // Customer case studies
  COMPETITOR_DOC // Competitor analysis
  OTHER          // Other documents
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique // Clerk authentication ID
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Platform-level role (optional, only for super_admin/manager)
  platformRole PlatformRole?

  // Organization membership (one org per user)
  organizationId   String?
  organization     Organization?     @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  organizationRole OrganizationRole?

  // Relations
  meetingParticipants MeetingParticipant[]
  improvementMetrics  ImprovementMetric[]
  auditLogs           AuditLog[]
  mockCallsAsUser     MockCall[]           @relation("MockCallUser")

  @@index([clerkId])
  @@index([organizationId])
  @@index([email])
}

// ============================================================================
// ORGANIZATION
// ============================================================================

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique // URL-friendly identifier
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Billing
  walletBalance Decimal @default(0) @db.Decimal(10, 2) // USD balance
  currency      String  @default("USD")

  // Feature flags (set by super_admin)
  liveAnalysisEnabled Boolean @default(true)
  mockCallsEnabled    Boolean @default(true)
  maxConcurrentCalls  Int     @default(5)

  // Relations
  users                User[]
  knowledgeDocuments   KnowledgeDocument[]
  competitors          Competitor[]
  meetings             Meeting[]
  billingTransactions  BillingTransaction[]
  featureFlags         FeatureFlag[]
  mockCalls            MockCall[]
  improvementMetrics   ImprovementMetric[]

  @@index([slug])
  @@index([isActive])
}

// ============================================================================
// KNOWLEDGE BASE
// ============================================================================

model KnowledgeDocument {
  id        String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  title        String
  description  String?
  documentType DocumentType
  fileUrl      String // S3/storage URL
  fileName     String
  fileSize     Int // bytes
  mimeType     String

  // Vector embeddings metadata
  embeddingGenerated Boolean @default(false)
  vectorStoreId      String? // External vector DB ID (Pinecone/Weaviate)
  
  uploadedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([organizationId])
  @@index([documentType])
  @@index([embeddingGenerated])
}

model Competitor {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name            String
  description     String?
  strengths       String[] // Array of strength points
  weaknesses      String[] // Array of weakness points
  differentiators String[] // How our product differs
  pricingInfo     String?
  website         String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
}

// ============================================================================
// MEETINGS
// ============================================================================

model Meeting {
  id             String        @id @default(cuid())
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  title          String
  description    String?
  status         MeetingStatus @default(SCHEDULED)
  
  // Meeting platform
  platform       String // "zoom", "google_meet", "teams"
  platformMeetingId String? // External meeting ID
  joinUrl        String?
  botJoinedAt    DateTime?
  botLeftAt      DateTime?
  
  // Timing
  scheduledAt    DateTime?
  startedAt      DateTime?
  endedAt        DateTime?
  durationMinutes Int? // Calculated for billing

  // Transcript
  transcriptUrl  String? // S3/storage URL
  transcriptGenerated Boolean @default(false)

  // Flags
  isRealMeeting  Boolean @default(true) // false for mock calls
  isBillable     Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  participants      MeetingParticipant[]
  transcript        TranscriptSegment[]
  analysis          MeetingAnalysis?
  liveSuggestions   LiveSuggestion[]
  billingTransaction BillingTransaction?

  @@index([organizationId])
  @@index([status])
  @@index([scheduledAt])
  @@index([isBillable])
}

model MeetingParticipant {
  id        String   @id @default(cuid())
  meetingId String
  meeting   Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  role      String? // "host", "participant", "bot"
  joinedAt  DateTime @default(now())
  leftAt    DateTime?

  @@unique([meetingId, userId])
  @@index([meetingId])
  @@index([userId])
}

model TranscriptSegment {
  id        String   @id @default(cuid())
  meetingId String
  meeting   Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  speakerName String
  speakerId   String? // Internal user ID or external participant ID
  text        String  @db.Text
  startTime   Int // Milliseconds from meeting start
  endTime     Int // Milliseconds from meeting start
  confidence  Decimal? @db.Decimal(5, 4) // 0.0 to 1.0

  createdAt DateTime @default(now())

  @@index([meetingId])
  @@index([startTime])
}

// ============================================================================
// AI ANALYSIS
// ============================================================================

model MeetingAnalysis {
  id        String   @id @default(cuid())
  meetingId String   @unique
  meeting   Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  status    AnalysisStatus @default(PENDING)
  
  // Scores (0-100 scale)
  clarityScore          Int?
  valueArticulationScore Int?
  objectionHandlingScore Int?
  discoveryScore        Int?
  overallScore          Int?

  // Talk ratio
  salesPersonTalkRatio Decimal? @db.Decimal(5, 2) // Percentage (0-100)

  // AI-generated content
  summary           String? @db.Text
  keyInsights       String[] // Array of insight strings
  mistakes          Json[] // Array of {type, description, timestamp, severity}
  missedOpportunities Json[] // Array of {description, timestamp, suggestion}
  improvements      Json[] // Array of {area, suggestion, priority}

  // Knowledge base grounding
  citedDocuments    String[] // Array of KnowledgeDocument IDs
  competitorsMentioned String[] // Array of Competitor IDs

  // Processing metadata
  processingStartedAt DateTime?
  processingCompletedAt DateTime?
  errorMessage        String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
}

model LiveSuggestion {
  id        String   @id @default(cuid())
  meetingId String
  meeting   Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  suggestionText String @db.Text
  context        String @db.Text // What triggered this suggestion
  priority       String @default("MEDIUM") // "HIGH", "MEDIUM", "LOW"
  category       String // "DISCOVERY", "OBJECTION", "VALUE_PROP", "NEXT_STEP"

  triggeredAt DateTime @default(now())
  viewedAt    DateTime?
  dismissedAt DateTime?

  // Reference to transcript timestamp
  transcriptStartTime Int?

  @@index([meetingId])
  @@index([triggeredAt])
}

// ============================================================================
// MOCK CALLS
// ============================================================================

model MockCall {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation("MockCallUser", fields: [userId], references: [id], onDelete: Cascade)

  title          String
  buyerPersona   BuyerPersona
  scenario       String @db.Text // Detailed scenario description
  
  // Mock meeting data
  transcriptUrl  String? // S3/storage URL
  durationMinutes Int?

  // AI Evaluation
  evaluationScore Int? // 0-100
  feedback        Json? // Structured feedback
  
  isBillable Boolean @default(false) // Typically free or discounted
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([userId])
  @@index([buyerPersona])
}

// ============================================================================
// COACHING & IMPROVEMENT
// ============================================================================

model ImprovementMetric {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  metricName     String // "objection_handling", "discovery_questions", "talk_ratio"
  metricValue    Decimal @db.Decimal(10, 2)
  measurementDate DateTime @default(now())

  // Aggregation period
  periodType     String @default("WEEKLY") // "DAILY", "WEEKLY", "MONTHLY"
  periodStart    DateTime
  periodEnd      DateTime

  // Context
  meetingCount   Int @default(1)
  notes          String?

  createdAt DateTime @default(now())

  @@index([organizationId])
  @@index([userId])
  @@index([metricName])
  @@index([periodStart])
}

// ============================================================================
// BILLING
// ============================================================================

model BillingTransaction {
  id             String          @id @default(cuid())
  organizationId String
  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  type           TransactionType
  amount         Decimal         @db.Decimal(10, 2) // USD
  balanceBefore  Decimal         @db.Decimal(10, 2)
  balanceAfter   Decimal         @db.Decimal(10, 2)

  // Meeting reference (for DEBIT transactions)
  meetingId      String?         @unique
  meeting        Meeting?        @relation(fields: [meetingId], references: [id], onDelete: SetNull)
  meetingDurationMinutes Int?

  // Metadata
  description    String?
  metadata       Json? // Additional context (e.g., payment gateway info)
  processedBy    String? // User ID if manual adjustment

  createdAt DateTime @default(now())

  @@index([organizationId])
  @@index([type])
  @@index([createdAt])
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
  description String?
  
  updatedBy String? // User ID
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@index([key])
}

model FeatureFlag {
  id             String       @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  flagName       String
  isEnabled      Boolean @default(false)
  description    String?

  // Scope: global (null organizationId) or org-specific
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, flagName])
  @@index([flagName])
}

// ============================================================================
// AUDIT LOG
// ============================================================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  action    String // "CREATE_ORG", "UPDATE_PRICING", "PAUSE_ORG", etc.
  resource  String // "Organization", "SystemConfig", "User", etc.
  resourceId String?
  
  changes   Json? // Before/after values
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
}