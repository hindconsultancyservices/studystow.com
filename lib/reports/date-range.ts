
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type ParseDateRangeOptions = {
  startDate?: string | null;
  endDate?: string | null;
  from?: string | null;
  to?: string | null;
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function parseDateRange(
  params: ParseDateRangeOptions
): DateRange {
  const startValue = params.startDate ?? params.from ?? null;
  const endValue = params.endDate ?? params.to ?? null;

  const startDate = parseDate(startValue);
  const endDate = parseDate(endValue);

  if (startDate && endDate && startDate > endDate) {
    throw new Error(
      "Start date cannot be later than end date."
    );
  }

  if (endDate) {
    // Include the entire selected end date.
    endDate.setHours(23, 59, 59, 999);
  }

  return {
    startDate,
    endDate,
  };
}

export function buildDateRangeFilter(
  range: DateRange,
  field = "createdAt"
): Record<string, { $gte?: Date; $lte?: Date }> {
  const filter: Record<
    string,
    { $gte?: Date; $lte?: Date }
  > = {};

  const condition: { $gte?: Date; $lte?: Date } = {};

  if (range.startDate) {
    condition.$gte = range.startDate;
  }

  if (range.endDate) {
    condition.$lte = range.endDate;
  }

  if (Object.keys(condition).length > 0) {
    filter[field] = condition;
  }

  return filter;
}
