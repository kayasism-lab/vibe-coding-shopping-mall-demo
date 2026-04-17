const DAY_IN_MS = 24 * 60 * 60 * 1000;

const rangeConfig = {
  "7d": { type: "day", bucketCount: 7, labelStep: 1 },
  "30d": { type: "day", bucketCount: 30, labelStep: 5 },
  "90d": { type: "week", bucketCount: 13, labelStep: 3 },
  "1y": { type: "month", bucketCount: 12, labelStep: 1 },
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const startOfDay = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

const addMonths = (value, months) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
};

const formatDayLabel = (date) => `${date.getMonth() + 1}/${date.getDate()}`;

const buildDailyBuckets = ({ bucketCount, labelStep }, now) => {
  const endDate = startOfDay(now);

  return Array.from({ length: bucketCount }, (_, index) => {
    const offset = bucketCount - index - 1;
    const start = addDays(endDate, -offset);
    const end = addDays(start, 1);

    return {
      key: start.toISOString(),
      label: formatDayLabel(start),
      displayLabel: index % labelStep === 0 || index === bucketCount - 1 ? formatDayLabel(start) : "",
      start,
      end,
      revenue: 0,
    };
  });
};

const buildWeeklyBuckets = ({ bucketCount, labelStep }, now) => {
  const periodEnd = addDays(startOfDay(now), 1);

  return Array.from({ length: bucketCount }, (_, index) => {
    const offset = bucketCount - index - 1;
    const start = addDays(periodEnd, -(offset + 1) * 7);
    const end = addDays(start, 7);
    const label = formatDayLabel(start);

    return {
      key: start.toISOString(),
      label,
      displayLabel: index % labelStep === 0 || index === bucketCount - 1 ? label : "",
      start,
      end,
      revenue: 0,
    };
  });
};

const buildMonthlyBuckets = ({ bucketCount, labelStep }, now) => {
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return Array.from({ length: bucketCount }, (_, index) => {
    const offset = bucketCount - index - 1;
    const start = addMonths(currentMonth, -offset);
    const end = addMonths(start, 1);
    const label = monthFormatter.format(start);

    return {
      key: start.toISOString(),
      label,
      displayLabel: index % labelStep === 0 || index === bucketCount - 1 ? label : "",
      start,
      end,
      revenue: 0,
    };
  });
};

const buildBuckets = (dateRange, now) => {
  const config = rangeConfig[dateRange] || rangeConfig["30d"];

  if (config.type === "week") {
    return buildWeeklyBuckets(config, now);
  }

  if (config.type === "month") {
    return buildMonthlyBuckets(config, now);
  }

  return buildDailyBuckets(config, now);
};

export const getRevenueChartBuckets = (orders, dateRange, now = new Date()) => {
  const buckets = buildBuckets(dateRange, now);

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const matchingBucket = buckets.find(
      (bucket) => createdAt >= bucket.start && createdAt < bucket.end
    );

    if (matchingBucket) {
      matchingBucket.revenue += Number(order.totalPrice || 0);
    }
  });

  return buckets;
};
