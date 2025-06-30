# Issue: Implement Driver Availability and Assignment Tracking (Drivers MVP)

## Description
Build driver availability and assignment tracking features for the Drivers module. This includes status tracking (Available, On Duty, Off Duty), conflict detection, current load assignments, and load completion rates.

## Acceptance Criteria
- Driver status is tracked and updated in real time.
- Conflict detection prevents overlapping assignments.
- Current load assignments and completion rates are visible.
- All flows are tested and documented.

## References
- See `main/src/features/drivers/` for UI and logic.
- Use server actions for availability and assignment logic.

## Checklist
- [ ] Driver status tracking
- [ ] Conflict detection
- [ ] Assignment tracking
- [ ] Load completion rates
- [ ] Tests and documentation

## Verification
- Update driver status, assign loads, and verify tracking/conflict detection.
- Run all tests and lint/typecheck.
