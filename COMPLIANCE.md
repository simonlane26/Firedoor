# Fire Safety (England) Regulations 2022 - Compliance Guide

This document explains how the Fire Door Inspector application ensures compliance with the Fire Safety (England) Regulations 2022.

## Regulatory Background

The Fire Safety (England) Regulations 2022 introduced new requirements for fire door inspections in multi-occupied residential buildings in England.

**Key Reference**: [Fire Safety (England) Regulations 2022: Fire Door Guidance](https://www.gov.uk/government/publications/fire-safety-england-regulations-2022-fire-door-guidance)

## Inspection Frequency Requirements

### Flat Entrance Doors
- **Minimum Frequency**: Every 12 months
- **Scope**: All flat entrance doors in the building
- **Best Endeavours**: The regulations require "best endeavours" to check all doors

**How the app ensures compliance:**
- Tracks last inspection date for each door
- Flags doors approaching 12-month deadline
- Records access denials with reasons (for unavailable flats)

### Communal Doors (Buildings > 11 meters)

- **Minimum Frequency**: Every 3 months
- **Applies to**: Buildings where top storey exceeds 11 meters (typically 4+ storeys)
- **Door Types Covered**:
  - Stairways
  - Lobbies
  - Corridors
  - Plant rooms
  - Service risers

**How the app ensures compliance:**
- Building height tracking (automatic 3-month cycle triggering)
- Door type classification
- Inspection scheduling based on door type and building height

## What Must Be Inspected

The guidance specifies visual checks for:

### 1. General Condition
✓ Absence of damage or defects affecting fire/smoke resistance

**App implementation:**
- Visual damage checkbox
- Damage description text field
- Photo upload capability

### 2. Door Closure
✓ Door closes completely into frame
✓ Self-closing device functions from any opening angle
✓ Gaps do not exceed 4mm (except bottom threshold)

**App implementation:**
- "Closes completely" checkbox
- "Closes from any angle" checkbox
- "Frame gaps acceptable" checkbox
- Maximum gap size measurement field
- Auto-fail if gaps > 4mm

### 3. Hardware
✓ Hinges and ironmongery in good condition and secure

**App implementation:**
- Hinges secure checkbox
- Hinge count field
- Hardware condition assessment

### 4. Fire Protection Features
✓ Intumescent strips intact (if originally fitted)
✓ Smoke seals intact (if originally fitted)

**App implementation:**
- Dynamic checklist - only shows if door has these features
- Separate checks for intumescent strips and smoke seals
- Critical failure if intumescent strips damaged

### 5. Additional Components
✓ Letterbox closes properly (flat entrance doors)
✓ Glazing intact (if present)
✓ Air transfer grilles intact (plant rooms)

**App implementation:**
- Conditional checks based on door registration
- Only shown for relevant door types

## Who Can Perform Inspections

The regulations emphasize accessibility:

> "These are visual checks which do not involve, for example, use of tools."

**Qualified Personnel:**
- Caretakers
- Managing agents
- Housing officers
- Maintenance personnel
- Professional inspectors

**App implementation:**
- No specialist certification required
- All checks are visual assessments
- User roles (Inspector, Manager, Admin) for organizational control

## Record Keeping Requirements

### What Must Be Recorded

Over each 12-month period, building management must maintain records showing:

1. **Steps taken** to check flat entrance doors
2. **Access denials** and reasons for non-inspection

**App implementation:**
- Permanent digital records of all inspections
- Access denial flag with mandatory reason field
- Inspector name and date automatically recorded
- Complete audit trail

### Record Retention

Records must demonstrate compliance during any regulatory inspection.

**App implementation:**
- All inspection data permanently stored in database
- Searchable and filterable inspection history
- Export capability for compliance reporting
- Dashboard showing compliance status

## Key Compliance Principles

### 1. Maintenance vs. Standards

**Important Clarification from Guidance:**
> "Identification of issues in relation to the type of door...is a matter for your fire risk assessment...It is not a matter for Regulation 10."

**What this means:**
- Inspections focus on **maintenance condition**
- Not about whether doors meet current manufacturing standards
- Doors adequate at installation remain suitable if maintained properly

**App implementation:**
- Focuses on visual condition checks
- Records installation date for reference
- Assesses current state, not original specification

### 2. Self-Closing Devices

**Critical Requirement:**
> "Self-closing devices must fully close the door from any opening angle"

**App implementation:**
- Specific checkbox for this requirement
- Automatic failure if not functioning
- High priority action flagging

### 3. Gap Tolerances

**Standard**: Maximum 4mm gaps (except bottom of door)

**App implementation:**
- Specific gap measurement field
- 4mm threshold enforcement
- Automatic failure if exceeded

## Compliance Workflow in the App

### For 12-Month Inspections (Flat Entrance Doors)

1. Inspector selects building and door
2. App shows TWELVE_MONTH inspection type
3. Complete checklist including:
   - Damage assessment
   - Closure function
   - Gap measurements
   - Letterbox (if present)
   - Intumescent strips/smoke seals
4. If access denied:
   - Mark "Access Denied"
   - Provide reason
   - Recorded for compliance reporting
5. Submit inspection

### For 3-Month Inspections (Communal Doors)

1. App automatically identifies based on:
   - Door type (Stairway, Corridor, etc.)
   - Building height (> 11m)
2. Inspection type: THREE_MONTH
3. Complete checklist:
   - All standard checks
   - Air transfer grille (plant rooms)
4. Submit with pass/fail/attention result

## Automatic Compliance Features

### 1. Inspection Scheduling
- Tracks last inspection date per door
- Calculates next due date based on type
- Dashboard shows overdue inspections

### 2. Pass/Fail Logic
The app automatically determines inspection results:

**FAIL** (Critical issues):
- Door won't close completely
- Self-closer not functioning
- Gaps exceed 4mm
- Damaged intumescent strips
- Major damage affecting fire resistance

**REQUIRES_ATTENTION** (Minor issues):
- Smoke seal damage
- Letterbox not closing properly
- Minor glazing issues
- Air transfer grille issues

**PASS**:
- All checks passed
- Door in good condition

### 3. Action Priority
Automatic priority assignment:
- **URGENT**: Immediate safety risk
- **HIGH**: Failed critical checks
- **MEDIUM**: Requires attention items
- **LOW**: Minor observations

### 4. Reporting
- Compliance dashboard showing:
  - Total doors registered
  - Inspections completed
  - Overdue inspections
  - Actions required
- Filterable inspection history
- Access denial tracking

## Best Practices for Compliance

### 1. Regular Inspection Cycles
- Schedule flat entrance doors for 11-month intervals (buffer before 12-month requirement)
- Schedule communal doors every 2.5 months (buffer before 3-month requirement)

### 2. Access Denial Management
- Always record reason for access denial
- Attempt re-inspection within reasonable timeframe
- Document communication with residents

### 3. Action Follow-Up
- Address HIGH and URGENT priorities immediately
- Schedule repairs for MEDIUM priorities
- Track completion of remedial work

### 4. Documentation
- Take photos of defects
- Add detailed notes for context
- Keep records of repairs and remedial work

## Regulatory Inspection Readiness

When regulatory authorities inspect your compliance:

**What they'll check:**
1. Evidence of regular inspections (12-month/3-month cycles)
2. Records of access denials
3. Action taken on identified issues
4. Competent person conducting inspections

**What the app provides:**
1. Complete inspection history with dates
2. Access denial records with reasons
3. Action tracking and priority flagging
4. Inspector names and credentials

## Legal Framework Summary

**Regulation 10** of the Fire Safety (England) Regulations 2022 requires:

- Responsible persons to check and maintain fire doors
- Regular inspection schedules based on door type and building height
- Record keeping of inspections and access denials
- Remedial action on identified issues

**This app ensures full compliance with all Regulation 10 requirements.**

## Disclaimer

This application is designed to facilitate compliance with the Fire Safety (England) Regulations 2022. However:

- The app does not replace professional fire risk assessments
- Complex issues should be referred to qualified fire safety professionals
- Legal responsibility remains with the building's responsible person
- Regular review of regulations and guidance is recommended

## Updates and Changes

Fire safety regulations may be updated. Users should:

- Monitor [gov.uk](https://www.gov.uk) for regulatory changes
- Review official guidance regularly
- Update inspection procedures as needed
- Consult fire safety professionals for clarification

---

**For official guidance, always refer to:**
[Fire Safety (England) Regulations 2022: Fire Door Guidance](https://www.gov.uk/government/publications/fire-safety-england-regulations-2022-fire-door-guidance)
