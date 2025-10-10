export const EventTypeKey = {
  // Engagement Events
  Seen: 'SEEN',

  // Auth Events
  AnonymousUserJoined: 'ANONYMOUS_USER_JOINED',
  AnonymousUserConverted: 'ANONYMOUS_USER_CONVERTED',
  Join: 'JOIN',
  EmailVerificationRequested: 'EMAIL_VERIFICATION_REQUESTED',
  EmailVerified: 'EMAIL_VERIFIED',
  Login: 'LOGIN',
  Logout: 'LOGOUT',
  PasswordResetRequested: 'PASSWORD_RESET_REQUESTED',
  PasswordChange: 'PASSWORD_CHANGE',
  EmailChange: 'EMAIL_CHANGE',
  UsernameChange: 'USERNAME_CHANGE',

  // Device Events
  DeviceAdded: 'DEVICE_ADDED',
  ForcedLogout: 'FORCED_LOGOUT',
  DeviceForcedLogout: 'DEVICE_FORCED_LOGOUT',
  DeviceForcedLogoutFailed: 'DEVICE_FORCED_LOGOUT_FAILED',
  LogoutAllDevices: 'LOGOUT_ALL_DEVICES',
  LogoutAllOtherDevices: 'LOGOUT_ALL_OTHER_DEVICES',

  // User Events
  TermsAndConditionsAccepted: 'TERMS_AND_CONDITIONS_ACCEPTED',
  PrivacyPolicyAccepted: 'PRIVACY_POLICY_ACCEPTED',
  ProfileUpdated: 'PROFILE_UPDATED',

  // Moderation Events
  UserSuspended: 'USER_SUSPENDED',
  UserUnsuspended: 'USER_UNSUSPENDED',
  UserBanned: 'USER_BANNED',
  UserUnbanned: 'USER_UNBANNED',

  // Item Events
  FreeItemPosted: 'FREE_ITEM_POSTED',
  FreeItemEdited: 'FREE_ITEM_EDITED',
  FreeItemDeleted: 'FREE_ITEM_DELETED',
  FreeItemSaved: 'FREE_ITEM_SAVED',
  FreeItemUnsaved: 'FREE_ITEM_UNSAVED',
  FreeItemTaken: 'FREE_ITEM_TAKEN',
  FreeItemConfirmedTaken: 'FREE_ITEM_CONFIRMED_TAKEN',
  FreeItemNotTaken: 'FREE_ITEM_NOT_TAKEN',
  FreeItemReported: 'FREE_ITEM_REPORTED',
  FreeItemUnreported: 'FREE_ITEM_UNREPORTED',
  ReportedFreeItemRemoved: 'REPORTED_FREE_ITEM_REMOVED',
  ReportedFreeItemRestored: 'REPORTED_FREE_ITEM_RESTORED',
  FreeItemExtended: 'FREE_ITEM_EXTENDED',

  // Other Events
  FeedbackRequested: 'FEEDBACK_REQUESTED',
  FeedbackSent: 'FEEDBACK_SENT'
} as const;
