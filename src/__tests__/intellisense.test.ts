import { describe, expect, test } from "vitest"
import { SectionParser } from "../SectionParser"
import type {
  ActivityType,
  ActivityTypeRepository,
  LoggedActivity,
  MeasurementType,
  MeasurementTypeRepository,
} from "../activity"
import type { EditorInterface, Position } from "../editorInterface"
import {
  DefaultIntellisenseProvider,
  type IntellisenseProvider,
} from "../intellisense"

class FakeEditor implements EditorInterface {
  constructor(
    private content: string[],
    private position: Position,
  ) {}

  getSection(caretLineNumber: number): string[] {
    let lines: string[] = [];
    for (let lineNum = caretLineNumber; lineNum > 0; lineNum--) {
      const line = this.getLineContent(lineNum);
      if (line === null) {
        break;
      }
      if (line.trim().length === 0) {
        break;
      } else {
        lines.push(line);
      }
    }
    lines = lines.reverse();

    for (let lineNum = caretLineNumber + 1; lineNum < this.getLineCount(); lineNum++) {
      const line = this.getLineContent(lineNum);
      if (line.trim().length === 0) {
        break;
      }
      lines.push(line);
    }

    return lines;
  }

  getLineContent(lineNum: number): string {
    return this.content[lineNum - 1];
  }
  getPosition(): Position {
    return this.position;
  }
  getLineCount(): number {
    return this.content.length;
  }
}

class MeasurementTypeRepositoryStatic implements MeasurementTypeRepository
{
  public getAll() {
    return <MeasurementType[]>[
      { name: "dist", units: ["km", "m", "cm"], defaultIcon: "➡" },
      { name: "elevation", units: ["m"], defaultIcon: "↗" }, // 〽
      { name: "stepHeight", units: ["m"], defaultIcon: "⬆" },
      { name: "time", units: ["hours", "mins", "secs"], defaultIcon: "⏱" },
      { name: "reps", units: ["count"], defaultIcon: "#️⃣" },
      { name: "steps", units: ["count"], defaultIcon: "#️⃣" },
      { name: "weights", units: ["kg"], defaultIcon: "🔩" }, // 🔩🏋
    ];
  }
}

class ActivityTypesStatic implements ActivityTypeRepository {
  public getAll(includeAbstract = false) {
    const all: ActivityType[] = [
      {
        name: "runningcycling",
        isBaseOnly: true,
        measurements: { dist: "km", time: "mins", elevation: "m" },
        physiologyLoad: { "rectus femoris": 0.7, "vastus lateralis": 0.2 },
      },
      {
        name: "running",
        //baseActivity: "runningcycling"
        measurements: { dist: "km", time: "mins", elevation: "m" },
      },
      {
        name: "stairs",
        measurements: { steps: "count", time: "mins", elevation: "m", stepHeight: "cm" },
      },
      {
        name: "pull-ups",
        measurements: { reps: "count", weights: "kg", time: "mins" },
      },
      {
        name: "pull-ups/excentric",
        baseActivity: "pull-ups",
      },
      {
        name: "notes",
        measurements: {},
      },
      // cross-fit: intensity, duration, reps per exercise ..?
      // yoga: type, intensity, duration ..?
    ];
    return includeAbstract === true
      ? all
      : all.filter((o) => o.isBaseOnly !== true);
  }
}

const getLoggedActivities = () => {
  const loggedActivities: LoggedActivity[] = [
    {
      activity: "running",
      timestamp: new Date(2024, 0, 1),
      measurements: [
        { measurement: "dist", value: 5, unit: "km" },
        { measurement: "time", value: 35, unit: "mins" },
      ],
    },
    {
      activity: "pull-ups",
      timestamp: new Date(2024, 0, 2),
      measurements: [
        { measurement: "reps", value: 5, unit: "count" }
      ],
    },
  ];
  return loggedActivities;
}

describe.each([
  { content: `
Ada, Ben

floor lift
Ben: weight:30kg reps:5 + 2 drop 10 + 1 help
Ada: weight:35kg reps:8
    ` },
  { content: `
Ada, Ben

floor lift / trap bar
weight:35kg
Ada: reps:5
Ben: reps:6 
    ` },
  { content: `
blabla
weight:35kg Ada: reps:15 Ben: reps:15 + 2 drop
    ` },
])("somom", ({ content }) => {
  test("axx", () => {
    // const editor = new FakeEditor(content.trim().split("\n"), { lineNumber: line, column: col });
    // const getActivityTypes = () => new ActivityTypesStatic().getAll();
    // const parseSection = (section: string[]) => new SectionParser().parse(section);
    // const sut: IntellisenseProvider = new DefaultIntellisenseProvider(editor, getLoggedActivities, getActivityTypes, parseSection);

    // const proposals = sut.getProposals();
    // expect(proposals.map((o, i) => o.startsWith(expected[i]))); //.toStrictEqual(expected);
  })
});


describe.each([
  { content: "running", line: 1, col: 1, expected: ["running", "pull-ups"] },
  { content: "running\n.", line: 2, col: 1, expected: ["dist", "time", "elevation"], },
  { content: "running\ndist:10km first half slow elevation:100m\n.", line: 3, col: 1, expected: ["time"], },
])("deee", ({ content, line, col, expected }) => {
  test("ax", () => {
    const editor = new FakeEditor(content.trim().split("\n"), { lineNumber: line, column: col });
    const getActivityTypes = () => new ActivityTypesStatic().getAll();
    const parseSection = (section: string[]) => new SectionParser().parse(section);
    const sut: IntellisenseProvider = new DefaultIntellisenseProvider(getLoggedActivities, getActivityTypes, parseSection, ln => editor.getSection(ln));

    const position = editor.getPosition();
    const proposals = sut.getProposals(position, editor.getLineContent(position.lineNumber - 1));
    expect(proposals.map((o, i) => o.startsWith(expected[i]))); //.toStrictEqual(expected);
  })
});

describe("Test", () => {
  test("Demo Testx", () => {
    const content = `
running
dist:10km first half slow elevation:100m
    `
    const sut = new SectionParser();
    expect(sut.parse(content.trim().split("\n"))).toStrictEqual(<LoggedActivity>{
      activity: "running",
      timestamp: new Date(2000, 0, 1),
      measurements: [
        { measurement: "dist", value: 10, unit: "km", comment: "first half slow" },
        { measurement: "elevation", value: 100, unit: "m" },
      ],
    });
  })
})
