export interface Dependency {
  version?: string;
  versionRange?: string
  id: string;
  downloadIfMissing?: string;
}
