const {
  ReportStatus,
  isValidTransition,
  validateTransition
} = require('./report.workflow');
const { ValidationError } = require('../../shared/errors/app-error');

describe('Report Workflow — Unit Tests (Rule 3)', () => {
  test('submitted_to_under_review_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW);

    // Assert
    expect(result).toBe(true);
  });

  test('under_review_to_verified_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.UNDER_REVIEW, ReportStatus.VERIFIED);

    // Assert
    expect(result).toBe(true);
  });

  test('under_review_to_rejected_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.UNDER_REVIEW, ReportStatus.REJECTED);

    // Assert
    expect(result).toBe(true);
  });

  test('verified_to_assigned_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.VERIFIED, ReportStatus.ASSIGNED);

    // Assert
    expect(result).toBe(true);
  });

  test('assigned_to_in_progress_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS);

    // Assert
    expect(result).toBe(true);
  });

  test('in_progress_to_resolved_transition_is_allowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED);

    // Assert
    expect(result).toBe(true);
  });

  test('submitted_directly_to_resolved_transition_is_disallowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.SUBMITTED, ReportStatus.RESOLVED);

    // Assert
    expect(result).toBe(false);
  });

  test('submitted_directly_to_assigned_transition_is_disallowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.SUBMITTED, ReportStatus.ASSIGNED);

    // Assert
    expect(result).toBe(false);
  });

  test('resolved_to_under_review_transition_is_disallowed', () => {
    // Arrange & Act
    const result = isValidTransition(ReportStatus.RESOLVED, ReportStatus.UNDER_REVIEW);

    // Assert
    expect(result).toBe(false);
  });

  test('validateTransition_throws_validation_error_on_disallowed_transition', () => {
    // Arrange & Act & Assert
    expect(() => {
      validateTransition(ReportStatus.SUBMITTED, ReportStatus.RESOLVED);
    }).toThrow(ValidationError);
  });
});
