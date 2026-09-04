import type { StaticImageData } from "next/image";

import helpAuthLogin from "@/assets/images/help_auth_login.png";
import helpAuthSignup from "@/assets/images/help_auth_signup.png";
import helpAuthVerify from "@/assets/images/help_auth_verify.png";
import helpAiToolkit from "@/assets/images/help_ai_toolkit.png";
import helpBskyAppPassword from "@/assets/images/help_bsky_app_password.png";
import helpComposerClear from "@/assets/images/help_composer_clear.png";
import helpComposerClearBtn from "@/assets/images/help_composer_clear_btn.png";
import helpComposerUnified from "@/assets/images/help_composer_unified.png";
import helpDraftList from "@/assets/images/help_draft_list.png";
import helpDraftSave from "@/assets/images/help_draft_save.png";
import helpFbBusinessLogin from "@/assets/images/help_fb_business_login.png";
import helpIgBusinessReady from "@/assets/images/help_ig_business_ready.png";
import helpIgChangeProfessional from "@/assets/images/help_ig_change_professional.png";
import helpIgChooseCategory from "@/assets/images/help_ig_choose_category.png";
import helpIgClickConnect from "@/assets/images/help_ig_click_connect.png";
import helpIgConnectedModal from "@/assets/images/help_ig_connected_modal.png";
import helpIgConnectWorld from "@/assets/images/help_ig_connect_world.png";
import helpIgCreatorOrBusiness from "@/assets/images/help_ig_creator_or_business.png";
import helpIgDashboardConnect from "@/assets/images/help_ig_dashboard_connect.png";
import helpIgLogin from "@/assets/images/help_ig_login.png";
import helpIgPermissions from "@/assets/images/help_ig_permissions.png";
import helpIgSecureConnection from "@/assets/images/help_ig_secure_connection.png";
import helpIgSocialAccounts from "@/assets/images/help_ig_social_accounts.png";
import helpInboxBulkAi from "@/assets/images/help_inbox_bulk_ai.png";
import helpLiAuthorize from "@/assets/images/help_li_authorize.png";
import helpLiConnected from "@/assets/images/help_li_connected.png";
import helpLiLogin from "@/assets/images/help_li_login.png";
import helpLivePreview from "@/assets/images/help_live_preview.png";
import helpMastoInstance from "@/assets/images/help_masto_instance.png";
import helpMediaAttach from "@/assets/images/help_media_attach.png";
import helpMediaLibrary from "@/assets/images/help_media_library.png";
import helpMediaStock from "@/assets/images/help_media_stock.png";
import helpPinAuthorize from "@/assets/images/help_pin_authorize.png";
import helpPlanFree from "@/assets/images/help_plan_free.png";
import helpPlanPro from "@/assets/images/help_plan_pro.png";
import helpSchedChooseDatetime from "@/assets/images/help_sched_choose_datetime.png";
import helpSchedComposer from "@/assets/images/help_sched_composer.png";
import helpSchedEditReschedule from "@/assets/images/help_sched_edit_reschedule.png";
import helpSchedPickTime from "@/assets/images/help_sched_pick_time.png";
import helpSchedPipeline from "@/assets/images/help_sched_pipeline.png";
import helpSchedTimeSet from "@/assets/images/help_sched_time_set.png";
import helpTeamAdded from "@/assets/images/help_team_added.png";
import helpTeamInvite from "@/assets/images/help_team_invite.png";
import helpTeamMembers from "@/assets/images/help_team_members.png";
import helpThAuthorize from "@/assets/images/help_th_authorize.png";
import helpThEditAccess from "@/assets/images/help_th_edit_access.png";
import helpUnifiedDashboard from "@/assets/images/help_unified_dashboard.png";
import helpUnifiedInbox from "@/assets/images/help_unified_inbox.png";
import helpWorkspaceCreateMenu from "@/assets/images/help_workspace_create_menu.png";
import helpWorkspaceNewModal from "@/assets/images/help_workspace_new_modal.png";
import helpWorkspaceSelector from "@/assets/images/help_workspace_selector.png";
import helpYtGoogleAccount from "@/assets/images/help_yt_google_account.png";
import helpYtPermissions from "@/assets/images/help_yt_permissions.png";

export const HELP_ARTICLE_IMAGES: Record<string, StaticImageData> = {
  "auth-signup": helpAuthSignup,
  "auth-login": helpAuthLogin,
  "auth-verify": helpAuthVerify,
  "ai-toolkit": helpAiToolkit,
  "workspace-selector": helpWorkspaceSelector,
  "workspace-create-menu": helpWorkspaceCreateMenu,
  "workspace-new-modal": helpWorkspaceNewModal,
  "ig-dashboard-connect": helpIgDashboardConnect,
  "ig-connect-world": helpIgConnectWorld,
  "ig-click-connect": helpIgClickConnect,
  "ig-secure-connection": helpIgSecureConnection,
  "ig-login": helpIgLogin,
  "ig-connected-modal": helpIgConnectedModal,
  "ig-change-professional": helpIgChangeProfessional,
  "ig-creator-or-business": helpIgCreatorOrBusiness,
  "ig-choose-category": helpIgChooseCategory,
  "ig-business-ready": helpIgBusinessReady,
  "ig-permissions": helpIgPermissions,
  "ig-social-accounts": helpIgSocialAccounts,
  "inbox-bulk-ai": helpInboxBulkAi,
  "li-login": helpLiLogin,
  "li-authorize": helpLiAuthorize,
  "li-connected": helpLiConnected,
  "live-preview": helpLivePreview,
  "yt-google-account": helpYtGoogleAccount,
  "yt-permissions": helpYtPermissions,
  "fb-business-login": helpFbBusinessLogin,
  "pin-authorize": helpPinAuthorize,
  "plan-free": helpPlanFree,
  "plan-pro": helpPlanPro,
  "th-authorize": helpThAuthorize,
  "th-edit-access": helpThEditAccess,
  "bsky-app-password": helpBskyAppPassword,
  "masto-instance": helpMastoInstance,
  "media-attach": helpMediaAttach,
  "media-library": helpMediaLibrary,
  "media-stock": helpMediaStock,
  "composer-unified": helpComposerUnified,
  "composer-clear-btn": helpComposerClearBtn,
  "composer-clear": helpComposerClear,
  "sched-composer": helpSchedComposer,
  "sched-pick-time": helpSchedPickTime,
  "sched-choose-datetime": helpSchedChooseDatetime,
  "sched-time-set": helpSchedTimeSet,
  "sched-pipeline": helpSchedPipeline,
  "sched-edit-reschedule": helpSchedEditReschedule,
  "draft-save": helpDraftSave,
  "draft-list": helpDraftList,
  "team-members": helpTeamMembers,
  "team-invite": helpTeamInvite,
  "team-added": helpTeamAdded,
  "unified-dashboard": helpUnifiedDashboard,
  "unified-inbox": helpUnifiedInbox,
};
