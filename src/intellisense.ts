import type { ActivityType, LoggedActivity } from "./activity"
import type { EditorInterface } from "./editorInterface"

export interface IntellisenseProvider {
  getProposals(): string[];
}

export class DefaultIntellisenseProvider implements IntellisenseProvider {
  public constructor(
    private editor: EditorInterface,
    private getLoggedActivities: () => LoggedActivity[],
    private getActivityTypes: () => ActivityType[],
    private parseSection: (section: string[]) => LoggedActivity,
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

  private getSection(lineNumInsideSection: number): string[] {
    let lines: string[] = [];
    for (let lineNum = lineNumInsideSection; lineNum > 0; lineNum--) {
      const line = this.editor.getLineContent(lineNum);
      if (line == null) {
        break;
      }
      if (line.trim().length === 0) {
        break;
      } else {
        lines.push(line);
      }
    }
    lines = lines.reverse();

    for (let lineNum = lineNumInsideSection + 1; lineNum < this.editor.getLineCount(); lineNum++) {
      const line = this.editor.getLineContent(lineNum);
      if (line.trim().length === 0) {
        break;
      }
      lines.push(line);
    }

    return lines;
  }

  public getProposals() {
    const position = this.editor.getPosition();

    const prevLineEmpty =
      position.lineNumber <= 1
        ? true
        : this.editor.getLineContent(position.lineNumber - 1).trim().length === 0;

    if (prevLineEmpty) {
      return this.getLoggedActivities().map((o) => o.activity);
    }

    const thisActivity = this.parseSection(this.getSection(this.editor.getPosition().lineNumber));
    const proposals = this.getProposalsForActivity(thisActivity);
    return proposals;
  }
}
