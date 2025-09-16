export interface DueDatesRequest {
  campaignName: string;
  directContactRanges: Range[];
  indirectContactRanges: Range[];
  brokenPromisesRanges: Range[];
  notContactedRanges: Range[];
}