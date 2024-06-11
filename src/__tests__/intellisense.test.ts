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
        measurements: {
          steps: "count",
          time: "mins",
          elevation: "m",
          stepHeight: "cm",
        },
      },
      {
        name: "pull-ups",
        measurements: { reps: "count", weights: "kg", time: "mins" }, //["reps:count", "weights:kg", "mins:time"]
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
      measurements: [{ measurement: "reps", value: 5, unit: "count" }],
    },
  ];
  return loggedActivities;
}

describe.each([
  { content: "running", line: 1, col: 1, expected: ["running", "pull-ups"] },
  { content: "running\n.", line: 2, col: 1, expected: ["dist", "time", "elevation"], },
  { content: "running\ndist:10km first half slow elevation:100m\n.", line: 3, col: 1, expected: ["time"], },
])("deee", ({ content, line, col, expected }) => {
  test("ax", () => {
    const editor = new FakeEditor(content.trim().split("\n"), { lineNumber: line, column: col });
    const getActivityTypes = () => new ActivityTypesStatic().getAll();
    const parseSection = (section: string[]) => new SectionParser().parse(section);
    const sut: IntellisenseProvider = new DefaultIntellisenseProvider(editor, getLoggedActivities, getActivityTypes, parseSection);

    expect(sut.getProposals()).toStrictEqual(expected);
  })
})

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
