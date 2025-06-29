# Project Requirements Document: Umbral Nexus

## 1. Executive Summary

### 1.1 Project Overview
Umbral Nexus is a browser-based, cooperative roguelike dungeon crawler designed for large group play (1-20 players). Players use their smartphones as controllers while viewing the game on a shared screen, creating a unique "party raid" experience that bridges the gap between mobile and console gaming.

### 1.2 Vision Statement
Create the definitive large-group gaming experience that transforms any gathering into an epic cooperative adventure, accessible through any web browser without downloads or installations.

### 1.3 Key Differentiators
- **Zero Friction Entry**: No app downloads, accounts, or setup required
- **Scalable Group Play**: Supports 1-20 players seamlessly
- **Multi-Screen Architecture**: Separate controller, main view, and spectator screens
- **Progressive Difficulty**: Roguelike power-ups create exponential power growth
- **Social Spectacle**: Designed for streaming and spectator engagement

## 2. Business Requirements

### 2.1 Target Audience
- **Primary**: Groups at social gatherings (parties, offices, conventions)
- **Secondary**: Streamers and their communities
- **Tertiary**: Families and casual gaming groups

### 2.2 Success Metrics
- **Adoption**: 10,000 unique games created within 3 months
- **Engagement**: Average session length > 45 minutes
- **Retention**: 40% of groups play multiple sessions
- **Virality**: 30% of players introduce the game to new groups

### 2.3 Business Model
- **Phase 1**: Free-to-play with optional donations
- **Phase 2**: Premium features (custom skins, private servers, extended sessions)
- **Phase 3**: Event packages for corporate/convention use

## 3. Functional Requirements

### 3.1 Core Game Loop

#### 3.1.1 Game Creation & Setup
- **FR-001**: Host creates game with configurable parameters
  - Player cap (1-20)
  - Victory conditions (time limit, death counter, floor target)
  - Difficulty modifiers
- **FR-002**: Unique 6-character GAMEID generation
- **FR-003**: QR code generation for easy sharing

#### 3.1.2 Player Experience
- **FR-004**: Join via URL or GAMEID entry
- **FR-005**: Character class selection (4 base classes minimum)
- **FR-006**: Persistent connection with automatic reconnection
- **FR-007**: Haptic feedback for actions (where supported)

#### 3.1.3 Exploration Mode
- **FR-008**: Real-time movement via D-pad interface
- **FR-009**: Multi-floor navigation with stair mechanics
- **FR-010**: Fog of war shared across all players
- **FR-011**: Item pickup and inventory management

#### 3.1.4 Combat Mode
- **FR-012**: Zone-based combat initiation
- **FR-013**: Action Point (AP) system (3 AP per turn)
- **FR-014**: Ability targeting with valid target highlighting
- **FR-015**: Turn order visualization
- **FR-016**: Combat log with damage/effect notifications

#### 3.1.5 Progression System
- **FR-017**: "Nexus Echo" power-up selection after boss defeats
- **FR-018**: 3 random choices from 200+ unique power-ups
- **FR-019**: Power-up stacking and synergy system
- **FR-020**: Visual indication of active power-ups

### 3.2 Multiplayer Features

#### 3.2.1 Screen Management
- **FR-021**: Main cast screen with intelligent camera
- **FR-022**: Player-specific spectator screens
- **FR-023**: Picture-in-picture for multi-floor combat
- **FR-024**: Streamlined UI for broadcasting

#### 3.2.2 Communication
- **FR-025**: Quick emote system (8 emotes minimum)
- **FR-026**: Ping system for location marking
- **FR-027**: Ready check system for coordination

### 3.3 Content & Procedural Generation

#### 3.3.1 Dungeon Generation
- **FR-028**: Procedural floor layouts (minimum 10 floor templates)
- **FR-029**: Themed floor types (5 themes at launch)
- **FR-030**: Dynamic difficulty scaling based on player count
- **FR-031**: Secret rooms and alternate paths

#### 3.3.2 Enemy Variety
- **FR-032**: 20+ unique enemy types at launch
- **FR-033**: 5+ boss encounters with unique mechanics
- **FR-034**: Elite enemy variants
- **FR-035**: Environmental hazards

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-001**: Support 20 concurrent players per game instance
- **NFR-002**: < 100ms input latency (regional servers)
- **NFR-003**: 60 FPS on cast screen (modern devices)
- **NFR-004**: < 3 second initial load time

### 4.2 Scalability
- **NFR-005**: Support 1,000 concurrent game sessions
- **NFR-006**: Horizontal scaling capability
- **NFR-007**: CDN integration for global distribution

### 4.3 Reliability
- **NFR-008**: 99.9% uptime SLA
- **NFR-009**: Automatic game state persistence
- **NFR-010**: Graceful degradation under load
- **NFR-011**: Player reconnection within 5 minutes

### 4.4 Security
- **NFR-012**: No user data collection beyond session
- **NFR-013**: Rate limiting on all endpoints
- **NFR-014**: Input validation and sanitization
- **NFR-015**: WebSocket message authentication

### 4.5 Accessibility
- **NFR-016**: WCAG 2.1 AA compliance
- **NFR-017**: Screen reader support
- **NFR-018**: Colorblind modes (3 options)
- **NFR-019**: Adjustable text size
- **NFR-020**: Reduced motion option

### 4.6 Compatibility
- **NFR-021**: Chrome, Safari, Firefox, Edge support (2 latest versions)
- **NFR-022**: iOS Safari and Android Chrome support
- **NFR-023**: Responsive design (320px - 4K)
- **NFR-024**: Progressive enhancement for older devices

## 5. Technical Requirements

### 5.1 Architecture
- **TR-001**: Monorepo structure (Turborepo)
- **TR-002**: TypeScript for type safety
- **TR-003**: WebSocket for real-time communication
- **TR-004**: Server-authoritative game state

### 5.2 Frontend Stack
- **TR-005**: React 18+ with TypeScript
- **TR-006**: Vite for build tooling
- **TR-007**: Zustand for state management
- **TR-008**: Tailwind CSS for styling
- **TR-009**: Radix UI for accessible components
- **TR-010**: Framer Motion for animations

### 5.3 Backend Stack
- **TR-011**: Node.js with Express/Fastify
- **TR-012**: WebSocket server (ws library)
- **TR-013**: Firebase/Firestore for persistence
- **TR-014**: Redis for session management (Phase 2)

### 5.4 Infrastructure
- **TR-015**: Vercel/Netlify for frontend hosting
- **TR-016**: Fly.io/Render for backend hosting
- **TR-017**: GitHub Actions for CI/CD
- **TR-018**: Cloudflare for CDN/DDoS protection

### 5.5 Monitoring & Analytics
- **TR-019**: Error tracking (Sentry)
- **TR-020**: Performance monitoring
- **TR-021**: Custom game analytics
- **TR-022**: A/B testing framework

## 6. Data Requirements

### 6.1 Game State Schema
```typescript
interface GameState {
  id: string;
  config: GameConfig;
  players: Player[];
  floors: Floor[];
  currentPhase: 'lobby' | 'active' | 'victory' | 'defeat';
  startTime: number;
  endConditions: EndConditions;
}
```

### 6.2 Persistence Strategy
- **DR-001**: Debounced state saves (max 1/second)
- **DR-002**: State recovery on server restart
- **DR-003**: 24-hour game state retention
- **DR-004**: Compressed state storage

## 7. Content Pipeline

### 7.1 Initial Content
- **CP-001**: 4 character classes with unique abilities
- **CP-002**: 200+ Nexus Echo power-ups
- **CP-003**: 5 dungeon themes with variations
- **CP-004**: 20+ enemy types
- **CP-005**: 5+ boss encounters

### 7.2 Post-Launch Content
- **CP-006**: Monthly power-up additions (10-20)
- **CP-007**: Quarterly new character class
- **CP-008**: Seasonal events with unique mechanics
- **CP-009**: Community-suggested content integration

## 8. Testing Requirements

### 8.1 Testing Strategy
- **TEST-001**: Unit tests (80% coverage minimum)
- **TEST-002**: Integration tests for critical paths
- **TEST-003**: Load testing (100+ concurrent connections)
- **TEST-004**: Chaos engineering for resilience
- **TEST-005**: Automated E2E tests for user flows

### 8.2 User Testing
- **TEST-006**: Alpha testing with 5 groups
- **TEST-007**: Beta testing with 50+ groups
- **TEST-008**: Streamer early access program
- **TEST-009**: Accessibility testing with users

## 9. Launch Requirements

### 9.1 Marketing Assets
- **MKT-001**: Landing page with game preview
- **MKT-002**: Video trailer (60 seconds)
- **MKT-003**: Streamer kit with overlays
- **MKT-004**: Social media templates

### 9.2 Documentation
- **DOC-001**: Player quick-start guide
- **DOC-002**: Streamer setup guide
- **DOC-003**: API documentation (Phase 2)
- **DOC-004**: Community guidelines

## 10. Success Criteria

### 10.1 Launch Criteria
- All Priority 1 features implemented
- < 0.1% crash rate in beta testing
- Performance targets met on 90% of devices
- Positive feedback from 80% of beta testers

### 10.2 Post-Launch Success
- Week 1: 1,000 games created
- Month 1: 10,000 unique players
- Month 3: 50,000 total games played
- Consistent growth trajectory

## 11. Risks & Mitigation

### 11.1 Technical Risks
- **RISK-001**: WebSocket connection instability
  - *Mitigation*: Implement reconnection logic, state recovery
- **RISK-002**: Server overload during viral moments
  - *Mitigation*: Auto-scaling, queue system, graceful degradation

### 11.2 Design Risks
- **RISK-003**: Learning curve for large groups
  - *Mitigation*: Tutorial mode, progressive complexity
- **RISK-004**: Spectator experience confusion
  - *Mitigation*: Clear UI indicators, onboarding tooltips

### 11.3 Business Risks
- **RISK-005**: Monetization resistance
  - *Mitigation*: Focus on value-add features, not pay-to-win
- **RISK-006**: Platform competition
  - *Mitigation*: Rapid iteration, community focus

## 12. Future Considerations

### 12.1 Phase 2 Features
- Custom game modes and modifiers
- Persistent player profiles
- Tournament/league system
- API for third-party integrations

### 12.2 Phase 3 Vision
- Native mobile apps for enhanced features
- VR spectator mode
- User-generated content tools
- Franchise opportunities for events