import { format } from "date-fns";

export class utility {
  static formatDate(date: Date | string, formatting: string = "dd-MM-yyyy") {
    return format(date, formatting);
  }

  // // if you start with [1, 2, 3, 4, 5], the shuffled array might be [3, 2, 5, 1, 4] or [5, 1, 4, 3, 2], depending on the random indices generated during the shuffle process.
  static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // testOne  == Test One
  static capitalizeCamelSpace(name: string): string {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalized.replace(/([A-Z])/g, " $1").trim();
  }

  static currencyFormatter(
    value: number,
    currency: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR" | null = null,
    format: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN" = "en-US",
  ): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
    };

    if (currency) {
      options.style = "currency";
      options.currency = currency;
    }

    const numberFormatter = new Intl.NumberFormat(format, options);
    let formattedValue = numberFormatter.format(Math.abs(value));

    if (value < 0) {
      formattedValue = currency
        ? formattedValue.replace(/^(\D+)/, "$1-")
        : `-${formattedValue}`;
    }
    return formattedValue;
  }
  // this is test....
  static titleSubstring(
    title: string,
    length: number = 35,
    max: number = 25,
  ): string {
    return title.length > length ? title.substring(0, max) + "..." : title;
  }

  static seoTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // "item.product._id"

  static getNestedProperty<T = unknown>(
    obj: Record<string, unknown>,
    propertyKey: string,
  ): T | undefined {
    return propertyKey.split(".").reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj) as T | undefined;
  }

  static hasObjectValues(obj: object) {
    return obj && Object.keys(obj).length > 0;
  }
}

export type HelperPrototype = typeof utility;

export const {
  formatDate,
  shuffleArray,
  capitalizeCamelSpace,
  currencyFormatter,
  titleSubstring,
  seoTitle,
  getNestedProperty,
  hasObjectValues,
} = utility;
