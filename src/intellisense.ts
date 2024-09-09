import type { ActivityType, LoggedActivity } from "./activity"
import type { EditorInterface, Position } from "./editorInterface"

export interface IntellisenseProvider {
  getProposals(position: Position, currentLineContent: string): string[];
}

export class DefaultIntellisenseProvider implements IntellisenseProvider {
  public constructor(
    private getLoggedActivities: () => LoggedActivity[],
    private getActivityTypes: () => ActivityType[],
    private parseSection: (section: string[]) => LoggedActivity,
    private getSection: (ln: number) => string[]
  ) {}

  private getProposalsForActivity(activity: LoggedActivity) {
    const activityTypes = this.getActivityTypes();
    const loggedActivities = this.getLoggedActivities();

    let proposedMeasurements: string[] = []
    const alreadyRegisteredMeasurements = activity.measurements.map(o => o.measurement);
    const found = loggedActivities.find((o) => o.activity === activity.activity);
    if (found) {
      // top suggestions: measurements filled out in previous logs but not yet here  not filled out
      proposedMeasurements = found.measurements
        .map((o) => o.measurement)
        .filter((o) => alreadyRegisteredMeasurements.indexOf(o) < 0);
    }
    const foundType = activityTypes.find((o) => o.name === activity.activity)
    if (foundType?.measurements) {
      proposedMeasurements = proposedMeasurements.concat(
        Object.keys(foundType.measurements).filter(o => proposedMeasurements.indexOf(o) < 0)
      );
    }
    return proposedMeasurements.filter(o => alreadyRegisteredMeasurements.indexOf(o) < 0);
  }

  public getProposals(position: Position, currentLineContent: string) {
    const prevLineEmpty =
      position.lineNumber <= 1
        ? true
        : currentLineContent.trim().length === 0; //this.editor.getLineContent(position.lineNumber - 1).trim().length === 0;

    if (prevLineEmpty) {
      return this.getLoggedActivities().map((o) => o.activity);
    }

    const thisActivity = this.parseSection(this.getSection(position.lineNumber));
    const proposals = this.getProposalsForActivity(thisActivity);
    return proposals;
  }
}
