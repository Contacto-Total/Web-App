export interface Range {
  min: string;
  max: string;
}

export interface CampaignReportRequest {
  campaignName: string;
  dueDates: string[];
  directContactRanges: Range[];
  indirectContactRanges: Range[];
  brokenPromisesRanges: Range[];
  notContactedRanges: Range[];
}