/** Bound values are sent separately from SQL. */
export class Params {
  readonly values: Record<string, unknown> = {};

  bind(value: string | string[], type: string): string {
    const name = `p${Object.keys(this.values).length}`;
    this.values[name] = value;
    return `{${name}:${type}}`;
  }
}
