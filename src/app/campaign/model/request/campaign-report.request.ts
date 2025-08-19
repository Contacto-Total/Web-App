export interface Range {
  min: string;
  max: string;
}

export interface CampaignReportRequest {
  directContactRanges: Range[];
  indirectContactRanges: Range[];
  brokenPromisesRanges: Range[];
  notContactedRanges: Range[];
}