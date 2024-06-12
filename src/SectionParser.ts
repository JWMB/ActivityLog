import type { LoggedActivity, Measurement } from "./activity"

export class SectionParser {
  public parse(section: string[]): LoggedActivity {
    const activity: LoggedActivity = {
      activity: section[0],
      timestamp: new Date(2000, 0, 1),
      measurements: [],
    };

    // const rxUserSpec = /\n\w+:\s/;
    const rx = /(?<measurement>\w+):(?<value>\d+)(?<unit>\w+)?/g; //(?<comment>\w+)?

    const sec = section.slice(1).join("\n");
    const matches: RegExpExecArray[] = [];
    while (true) {
      const r = rx.exec(sec);
      if (r == null || r.groups == null)
        break;
      matches.push(r);
    }

    const results = matches.map((match, i) => {
      if (match.groups == null)
        throw "aaa";
      let comment: string | undefined = undefined;
      if (i < matches.length - 1) {
        const c = sec
          .substring(match.index + match[0].length, matches[i + 1].index - 1)
          .trim();
        if (c.length)
          comment = c;
      }
      const m = <Measurement>{
        measurement: match.groups["measurement"] || "",
        value: Number.parseFloat(match.groups["value"]),
        unit: match.groups["unit"] || undefined,
        comment: comment,
      };
      if (m.comment == null)
        delete m.comment;
      if (m.unit == null)
        delete m.unit;
      return m;
    })

    activity.measurements = results;
    // TODO: comments pre- or post
    return activity;
  }
}
