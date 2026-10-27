const { ValidationError } = require('../../shared/errors/app-error');

const ReportStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED'
};

// Explicit allowed state transitions map
const ALLOWED_TRANSITIONS = {
  [ReportStatus.SUBMITTED]: [ReportStatus.UNDER_REVIEW],
  [ReportStatus.UNDER_REVIEW]: [ReportStatus.VERIFIED, ReportStatus.REJECTED],
  [ReportStatus.VERIFIED]: [ReportStatus.ASSIGNED],
  [ReportStatus.ASSIGNED]: [ReportStatus.IN_PROGRESS],
  [ReportStatus.IN_PROGRESS]: [ReportStatus.RESOLVED],
  [ReportStatus.RESOLVED]: [], // Terminal state
  [ReportStatus.REJECTED]: []  // Terminal state
};

/**
 * Pure domain function to evaluate if a state transition is permitted
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function isValidTransition(currentStatus, nextStatus) {
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedNext.includes(nextStatus);
}

/**
 * Validates transition and throws ValidationError if disallowed
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 */
function validateTransition(currentStatus, nextStatus) {
  if (!isValidTransition(currentStatus, nextStatus)) {
    throw new ValidationError(
      `Invalid report status transition from '${currentStatus}' to '${nextStatus}'. ` +
      `Allowed transitions from '${currentStatus}': [${(ALLOWED_TRANSITIONS[currentStatus] || []).join(', ')}]`
    );
  }
}

module.exports = {
  ReportStatus,
  ALLOWED_TRANSITIONS,
  isValidTransition,
  validateTransition
};
