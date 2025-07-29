/**
 * Represents an array of releases from the API.
 *
 * https://api.github.com/repos/[owner]/[repo]/releases
 */
export type Releases = Release[] | Message;

export interface Message {
  message?: string;
  documentation_url?: string;
}

/** Represents the information for a release. */
export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: User;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;

  /** ISO-8601 */
  created_at: string;

  /** ISO-8601 */
  published_at: string;
  assets: ReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

/** Represents a release asset. */
export interface ReleaseAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: null | string;
  uploader: User;
  content_type: string;
  state: string;
  size: number;
  download_count: number;

  /** ISO-8601 */
  created_at: string;

  /** ISO-8601 */
  updated_at: string;
  browser_download_url: string;
}

/**
 * Represents repository info from the API.
 *
 * https://api.github.com/repos/[user]/[repo]
 */
export interface Repository extends Message {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;

  /** ISO-8601 */
  created_at: string;

  /** ISO-8601 */
  updated_at: string;

  /** ISO-8601 */
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: null | string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: null | string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: null | string;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: any[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: null | string;
  network_count: number;
  subscribers_count: number;
}

/** User info provided in other objects */
export interface User {
  /** The user's GitHub login (username). */
  login: string;

  /** The user's unique GitHub ID. */
  id: number;

  /** The user's GraphQL node ID. */
  node_id: string;

  /** URL to the user's avatar image. */
  avatar_url: string;

  /** Deprecated gravatar ID (usually empty). */
  gravatar_id: string;

  /** API URL to the user's profile resource. */
  url: string;

  /** Public URL to the user's GitHub profile page. */
  html_url: string;

  /** API URL to the user's followers. */
  followers_url: string;

  /** API URL template for users the user is following. */
  following_url: string;

  /** API URL template for the user's gists. */
  gists_url: string;

  /** API URL template for repositories the user has starred. */
  starred_url: string;

  /** API URL to the user's subscriptions. */
  subscriptions_url: string;

  /** API URL to the user's organizations. */
  organizations_url: string;

  /** API URL to the user's public repositories. */
  repos_url: string;

  /** API URL to the user's public events. */
  events_url: string;

  /** API URL to the events the user has received. */
  received_events_url: string;

  /** Type of user (e.g., "User" or "Organization"). */
  type: string;

  /** Whether the user is a GitHub site administrator. */
  site_admin: boolean;
}

/**
 * Represents the full user info from the API.
 *
 * https://api.github.com/users/[user]
 */
export interface FullUser extends User, Message {
  /** The user's full name (if provided). */
  name: string | null;

  /** The user's company affiliation (may be null). */
  company: string | null;

  /** The user's blog URL (may be empty or null). */
  blog: string | null;

  /** The user's location (if provided). */
  location: string | null;

  /** The user's public email (if available). */
  email: string | null;

  /** Whether the user is available for hire. */
  hireable: boolean | null;

  /** The user's biography or profile description. */
  bio: string | null;

  /** The user's Twitter handle (if linked). */
  twitter_username: string | null;

  /** Number of public repositories the user owns. */
  public_repos: number;

  /** Number of public gists the user owns. */
  public_gists: number;

  /** Number of followers the user has. */
  followers: number;

  /** Number of users the user is following. */
  following: number;

  /** ISO 8601 date string of when the account was created. */
  created_at: string;

  /** ISO 8601 date string of the last profile update. */
  updated_at: string;
}

/**
 * Represents the rate limits from the API.
 *
 * https://api.github.com/rate_limit
 */
export interface RateLimits {
  resources: Resources;
  rate: Rate;
}

export interface Rate {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource?: string;
}

export interface Resources {
  core: Rate;
  search: Rate;
  graphql: Rate;
  integration_manifest: Rate;
  source_import?: Rate;
  code_scanning_upload?: Rate;
  actions_runner_registration?: Rate;
  scim?: Rate;
  dependency_snapshots?: Rate;
  audit_log?: Rate;
  audit_log_streaming?: Rate;
  code_search?: Rate;
}

/**
 * Represents the contents of a repo.
 *
 * https://api.github.com/repos/[user]/[repo]/contents
 */
export interface RepoContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: null | string;
  type: string;
  _links: Links;
}

export type RepoContents = RepoContent[] | Message;

export interface Links {
  self: string;
  git: string;
  html: string;
}
